import math
from typing import cast, Any
from unittest.mock import MagicMock

import numpy as np
import pytest
from astropy import units as u
from astropy.units import Quantity
from matplotlib.figure import Figure
from pytest import MonkeyPatch
from synphot import SourceSpectrum, ConstFlux1D, units, SpectralElement, Observation

from constants import get_minimum_wavelength, get_maximum_wavelength
from nirwals.configuration import Source, Grating, Exposure
from nirwals.physics.exposure import (
    wavelength_resolution_element,
    pixel_wavelength_range,
    source_observation,
    sky_observation,
    detection_rates,
    readout_noise,
    snr,
)
from nirwals.tests.utils import get_default_configuration, create_matplotlib_figure

# Mock values. Prime numbers are used so that multiplying different mock values is
# guaranteed to yield different results.
_MOCK_SOURCE_SPECTRUM = ("source_spectrum", 2)
_MOCK_SKY_SPECTRUM = ("sky_spectrum", 3)
_MOCK_ATMOSPHERIC_TRANSMISSION = ("atmospheric_transmission", 5)
_MOCK_TELESCOPE_THROUGHPUT = ("telescope_throughput", 7)
_MOCK_FIBRE_THROUGHPUT = ("fibre_throughput", 11)
_MOCK_FILTER_TRANSMISSION = ("filter_transmission", 13)
_MOCK_GRATING_EFFICIENCY = ("grating_efficiency", 17)
_MOCK_DETECTOR_QUANTUM_EFFICIENCY = ("detector_quantum_efficiency", 19)


def _patch(monkeypatch: MonkeyPatch) -> dict[str, MagicMock]:
    mocks: dict[str, MagicMock] = dict()

    # Source spectrum
    source_mock = MagicMock(
        return_value=SourceSpectrum(
            ConstFlux1D, amplitude=_MOCK_SOURCE_SPECTRUM[1] * units.PHOTLAM
        )
    )
    monkeypatch.setattr("nirwals.physics.exposure.source_spectrum", source_mock)
    mocks["source_spectrum"] = source_mock

    # Sky background spectrum
    sky_mock = MagicMock(
        return_value=SourceSpectrum(
            ConstFlux1D, amplitude=_MOCK_SKY_SPECTRUM[1] * units.PHOTLAM
        )
    )
    monkeypatch.setattr("nirwals.physics.exposure.sky_spectrum", sky_mock)
    mocks["sky_spectrum"] = sky_mock

    # Bandpasses
    for m in (
        _MOCK_ATMOSPHERIC_TRANSMISSION,
        _MOCK_TELESCOPE_THROUGHPUT,
        _MOCK_FIBRE_THROUGHPUT,
        _MOCK_FILTER_TRANSMISSION,
        _MOCK_GRATING_EFFICIENCY,
        _MOCK_DETECTOR_QUANTUM_EFFICIENCY,
    ):
        mock = MagicMock(return_value=SpectralElement(ConstFlux1D, amplitude=m[1]))
        monkeypatch.setattr(f"nirwals.physics.exposure.{m[0]}", mock)
        mocks[m[0]] = mock

    return mocks


class _MockLinearObservation:
    """
    A mock (and completely unrealistic) observation.

    The flux f for the observation is linear in the wavelength, f = gradient * l.

    The rates method returns the wavelengths and rates that the detection_rates method
    of the nirwals.physics.exposure module should return.

    Parameters
    ----------
    pixel_wavelength_range: Quantity
        Wavelength range covered by a pixel.
    binning: int
        Binning required to cover the wavelength resolution element.
    """

    gradient = 7

    def __init__(self, pixel_wavelength_range: u.AA, binning: int):
        self.pixel_wavelength_range = pixel_wavelength_range
        self.wavelengths = (
            np.arange(10, 1001, self.pixel_wavelength_range.to(u.AA).value) * u.AA
        )
        self.binning = binning

    @property
    def binset(self) -> Quantity:
        return self.wavelengths

    def __call__(self, wavelength: Quantity) -> Quantity:
        return self._f(wavelength.to(u.AA).value) * units.PHOTLAM

    def rates(self, area: Quantity) -> tuple[Quantity, Quantity]:
        binned_wavelengths: list[float] = []
        binned_fluxes: list[float] = []
        bin = 0
        while bin < len(self.binset):
            wavelength = (
                self.wavelengths[0].to(u.AA).value
                + (bin + 0.5 * (self.binning - 1))
                * self.pixel_wavelength_range.to(u.AA).value
            )
            binned_wavelengths.append(wavelength)
            binned_flux = 0.0
            for _ in range(self.binning):
                binned_flux += self._bin_integral(bin)
                bin += 1
            binned_fluxes.append(binned_flux)

        return (
            np.array(binned_wavelengths) * u.AA,
            np.array(binned_fluxes) * area * u.AA * units.PHOTLAM,
        )

    def _bin_integral(self, bin: int) -> float:
        if bin > len(self.binset) - 1:
            return 0
        dx = self.pixel_wavelength_range.to(u.AA).value
        x = self.binset[bin].to(u.AA).value
        m = self.gradient
        if bin == 0:
            y = self._f(x)
            return cast(float, (3 / 8) * y + 0.5 * m * ((x + dx / 2) ** 2 - x**2))
        elif bin == len(self.binset) - 1:
            return cast(float, 0.5 * m * (x**2 - (x - dx / 2) ** 2))
        else:
            return cast(float, 0.5 * m * ((x + dx / 2) ** 2 - (x - dx / 2) ** 2))

    def _f(self, x: Any) -> Any:
        return self.gradient * x


class _MockConstantObservation:
    """
    A mock (and completely unrealistic) observation.

    The observation has a constant user-specified flux and a binset from 100 to 1000 A
    with a spacing of 1 A.

    Parameters
    ----------
    flux
        The constant flux.
    """

    def __init__(self, flux: Quantity) -> None:
        self.flux = flux

    def __call__(self, wavelength: Quantity) -> Quantity:
        return self.flux * np.ones(len(wavelength))

    @property
    def binset(self) -> Quantity:
        return np.arange(8000, 17000, 1) * u.AA


def test_wavelength_resolution_element(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr("nirwals.physics.exposure.FIBRE_RADIUS", 2 * u.arcsec)
    monkeypatch.setattr("nirwals.physics.exposure.TELESCOPE_FOCAL_LENGTH", 50 * u.m)
    monkeypatch.setattr("nirwals.physics.exposure.COLLIMATOR_FOCAL_LENGTH", 0.75 * u.m)
    grating_constant = 2 * u.um
    grating_angle = 60 * u.deg

    dlambda = wavelength_resolution_element(grating_angle, grating_constant)
    assert pytest.approx(dlambda.to(u.m).value) == (math.pi / 2.43) * 1e-9


def test_pixel_wavelength_range(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr("nirwals.physics.exposure.CAMERA_FOCAL_LENGTH", 0.2 * u.m)
    monkeypatch.setattr("nirwals.physics.exposure.CCD_PIXEL_SIZE", 15 * u.um)
    grating_constant = 3 * u.um
    grating_angle = 60 * u.deg

    dlambda = pixel_wavelength_range(grating_angle, grating_constant)
    assert pytest.approx(dlambda.to(u.m).value) == 1.125e-10


def test_source_observation(monkeypatch: MonkeyPatch) -> None:
    # Create the observation.
    mocks = _patch(monkeypatch)
    configuration = get_default_configuration()
    observation = source_observation(configuration)

    # Check that the relevant functions were called with the correct parameter values.
    mocks["source_spectrum"].assert_called_once_with(configuration=configuration)
    mocks["atmospheric_transmission"].assert_called_once_with(
        zenith_distance=configuration.zenith_distance
    )
    mocks["telescope_throughput"].assert_called_once()
    source = cast(Source, configuration.source)
    mocks["fibre_throughput"].assert_called_once_with(
        seeing=configuration.seeing,
        source_extension=source.extension,
        zenith_distance=configuration.zenith_distance,
    )
    mocks["filter_transmission"].assert_called_once_with(
        filter_name=configuration.telescope.filter
    )
    grating = cast(Grating, configuration.telescope.grating)
    mocks["grating_efficiency"].assert_called_once_with(
        grating_angle=grating.grating_angle,
        grating_name=grating.name,
    )
    mocks["detector_quantum_efficiency"].assert_called_once()

    # Check that the calculation was done correctly. We can just multiply the constant
    # mock values, as all bandpasses are mocked with constant functions.
    wavelength = 12345 * u.AA
    expected_rate = (
        _MOCK_SOURCE_SPECTRUM[1]
        * units.PHOTLAM
        * _MOCK_ATMOSPHERIC_TRANSMISSION[1]
        * _MOCK_TELESCOPE_THROUGHPUT[1]
        * _MOCK_FIBRE_THROUGHPUT[1]
        * _MOCK_FILTER_TRANSMISSION[1]
        * _MOCK_GRATING_EFFICIENCY[1]
        * _MOCK_DETECTOR_QUANTUM_EFFICIENCY[1]
    )
    actual_rate = observation(wavelength)

    assert (
        pytest.approx(actual_rate.to(units.PHOTLAM).value)
        == expected_rate.to(units.PHOTLAM).value
    )


def test_source_observation_binset(monkeypatch: MonkeyPatch) -> None:
    # Patch the function needed for calculating the bin set.
    pwr_mock = MagicMock(return_value=5 * u.AA)
    monkeypatch.setattr("nirwals.physics.exposure.pixel_wavelength_range", pwr_mock)

    # Create the observation.
    _patch(monkeypatch)
    configuration = get_default_configuration()
    observation = source_observation(configuration)

    # Check that the bin set is correct
    lambda_min = get_minimum_wavelength().to(u.AA).value
    lambda_max = get_maximum_wavelength().to(u.AA).value
    binset = observation.binset.to(u.AA).value
    assert pytest.approx(binset[0]) == lambda_min - 100
    assert pytest.approx(binset[1]) == lambda_min - 95
    assert pytest.approx(binset[2]) == lambda_min - 90
    assert binset[-1] >= lambda_max + 100


@pytest.mark.mpl_image_compare
def test_source_observation_without_mocking() -> Figure:
    configuration = get_default_configuration()
    observation = source_observation(configuration)
    wavelengths = observation.binset
    fluxes = observation(wavelengths)

    return create_matplotlib_figure(wavelengths, fluxes)


def test_sky_observation(monkeypatch: MonkeyPatch) -> None:
    # Create the observation.
    mocks = _patch(monkeypatch)
    configuration = get_default_configuration()
    observation = sky_observation(configuration)

    # Check that the relevant functions were called with the correct parameter values.
    mocks["sky_spectrum"].assert_called_once()
    mocks["telescope_throughput"].assert_called_once()
    mocks["fibre_throughput"].assert_called_once_with(
        seeing=configuration.seeing,
        source_extension="Diffuse",
        zenith_distance=configuration.zenith_distance,
    )
    mocks["filter_transmission"].assert_called_once_with(
        filter_name=configuration.telescope.filter
    )
    grating = cast(Grating, configuration.telescope.grating)
    mocks["grating_efficiency"].assert_called_once_with(
        grating_angle=grating.grating_angle,
        grating_name=grating.name,
    )
    mocks["detector_quantum_efficiency"].assert_called_once()

    # Assert that the atmospheric transmission has not been applied.
    mocks["atmospheric_transmission"].assert_not_called()

    # Check that the calculation was done correctly. We can just multiply the constant
    # mock values, as all bandpasses are mocked with constant functions.
    wavelength = 12345 * u.AA
    expected_rate = (
        _MOCK_SKY_SPECTRUM[1]
        * units.PHOTLAM
        * _MOCK_TELESCOPE_THROUGHPUT[1]
        * _MOCK_FIBRE_THROUGHPUT[1]
        * _MOCK_FILTER_TRANSMISSION[1]
        * _MOCK_GRATING_EFFICIENCY[1]
        * _MOCK_DETECTOR_QUANTUM_EFFICIENCY[1]
    )
    actual_rate = observation(wavelength)

    assert (
        pytest.approx(actual_rate.to(units.PHOTLAM).value)
        == expected_rate.to(units.PHOTLAM).value
    )


def test_sky_observation_binset(monkeypatch: MonkeyPatch) -> None:
    # Patch the function needed for calculating the bin set.
    pwr_mock = MagicMock(return_value=5 * u.AA)
    monkeypatch.setattr("nirwals.physics.exposure.pixel_wavelength_range", pwr_mock)

    # Create the observation.
    _patch(monkeypatch)
    configuration = get_default_configuration()
    observation = sky_observation(configuration)

    # Check that the bin set is correct
    lambda_min = get_minimum_wavelength().to(u.AA).value
    lambda_max = get_maximum_wavelength().to(u.AA).value
    binset = observation.binset.to(u.AA).value
    assert pytest.approx(binset[0]) == lambda_min - 100
    assert pytest.approx(binset[1]) == lambda_min - 95
    assert pytest.approx(binset[2]) == lambda_min - 90
    assert binset[-1] >= lambda_max + 100


@pytest.mark.mpl_image_compare
def test_sky_observation_without_mocking() -> Figure:
    configuration = get_default_configuration()
    observation = sky_observation(configuration)
    wavelengths = observation.binset
    fluxes = observation(wavelengths)

    return create_matplotlib_figure(wavelengths, fluxes)


@pytest.mark.parametrize(
    "binning, pixel_wavelength_range, wavelength_resolution_element",
    [(5, 3 * u.AA, 13 * u.AA), (6, 3 * u.AA, 17 * u.AA)],
)
def test_detection_rates(
    binning: int,
    pixel_wavelength_range: Quantity,
    wavelength_resolution_element: Quantity,
    monkeypatch: MonkeyPatch,
) -> None:
    # Patch the wavelength resolution element.
    wre_mock = MagicMock(return_value=wavelength_resolution_element)
    monkeypatch.setattr(
        "nirwals.physics.exposure.wavelength_resolution_element", wre_mock
    )

    observation = _MockLinearObservation(
        pixel_wavelength_range=pixel_wavelength_range, binning=binning
    )
    area = 10 * u.cm**2
    expected_rates = observation.rates(area)
    grating_angle = 40 * u.deg
    grating_constant = 2 * u.micron
    actual_rates = detection_rates(
        area=area,
        grating_angle=grating_angle,
        grating_constant=grating_constant,
        observation=cast(Observation, observation),
    )

    # Sanity check: Our patched methods were used.
    wre_mock.assert_called_once_with(
        grating_angle=grating_angle, grating_constant=grating_constant
    )

    # Check that the correct wavelengths and rates were calculated. As the rates in the
    # first and last bin are considered to be arbitrary, we ignore these bins.
    assert np.allclose(
        actual_rates[0][1:-1].to(u.AA).value, expected_rates[0][1:-1].to(u.AA).value
    )
    assert np.allclose(
        actual_rates[1][1:-1].to(u.cm**2 * u.AA * units.PHOTLAM).value,
        expected_rates[1][1:-1].to(u.cm**2 * u.AA * units.PHOTLAM).value,
    )


def test_readout_noise() -> None:
    assert (
        pytest.approx(readout_noise(read_noise=5, samplings=3, sampling_type="Fowler"))
        == 50 / 3
    )
    assert (
        pytest.approx(
            readout_noise(read_noise=8, samplings=5, sampling_type="Up-the-Ramp")
        )
        == 153.6
    )


def test_snr_value(monkeypatch: MonkeyPatch) -> None:
    # Mock the source observation to have a constant flux of 7 PHOTLAM and a bin set
    # spacing of 1 A.
    source_mock = MagicMock(return_value=_MockConstantObservation(7 * units.PHOTLAM))
    monkeypatch.setattr("nirwals.physics.exposure.source_observation", source_mock)

    # Mock the source observation to have a constant flux of 3 PHOTLAM and a bin set
    # spacing of 1 A.
    sky_mock = MagicMock(return_value=_MockConstantObservation(3 * units.PHOTLAM))
    monkeypatch.setattr("nirwals.physics.exposure.sky_observation", sky_mock)

    # Choose the wavelength resolution element so that the detection rate bins will have
    # a size of 10 A.
    wre_mock = MagicMock(return_value=10 * u.AA)
    monkeypatch.setattr(
        "nirwals.physics.exposure.wavelength_resolution_element", wre_mock
    )

    # Choose a mirror area of 1 cm^2, two exposures and an exposure time of 3 seconds.
    configuration = get_default_configuration()
    configuration.telescope.effective_mirror_area = 1 * u.cm**2
    exposure = cast(Exposure, configuration.exposure)
    exposure.exposures = 2
    exposure.exposure_time = 3 * u.s

    # Choose the readout noise per exposure to be 12.5.
    rn_mock = MagicMock(return_value=12.5)
    monkeypatch.setattr("nirwals.physics.exposure.readout_noise", rn_mock)

    # With the above choices the detection rate for the source will be 70 per second,
    # and that for the sky 30 per second. Hence, the signal will be 70 * 2 * 3 = 420,
    # whereas the noise will be the square root of (70 + 30) * 2 * 3 + 12.5 * 2 = 625,
    # i.e. 25. The SNR thus should be 420 / 25 = 16.8.
    wavelengths, snr_values = snr(configuration)
    assert pytest.approx(snr_values[20]) == 16.8


@pytest.mark.mpl_image_compare
def test_snr() -> Figure:
    configuration = get_default_configuration()
    wavelengths, snr_values = snr(configuration)

    return create_matplotlib_figure(wavelengths, snr_values * u.dimensionless_unscaled)
