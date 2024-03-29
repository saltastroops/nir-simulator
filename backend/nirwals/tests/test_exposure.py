import dataclasses
import math
from typing import cast, Any
from unittest.mock import MagicMock

import numpy as np
import pytest
from astropy import units as u
from astropy.units import Quantity
from matplotlib.figure import Figure
from pytest import MonkeyPatch
from synphot import (
    SourceSpectrum,
    ConstFlux1D,
    units,
    SpectralElement,
    Observation,
    Empirical1D,
)

from constants import get_minimum_wavelength, get_maximum_wavelength
from nirwals.configuration import Source, Grating, Exposure, SNR, GratingName
from nirwals.physics.exposure import (
    wavelength_resolution_element,
    pixel_wavelength_range,
    source_observation,
    sky_observation,
    detection_rates,
    readout_noise,
    snr,
    exposure_time,
    electrons,
    source_electrons,
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


def test_electron_values(monkeypatch: MonkeyPatch) -> None:
    # Define the relevant parameters.
    area = 543210 * u.cm**2
    exposures = 3
    exposure_time = 123 * u.s
    grating_angle = 35 * u.deg
    grating_constant = 4 * u.micron
    observation = _MockConstantObservation(flux=7 * units.PHOTLAM)

    # Mock the detection rate.
    wavelengths_ = np.array([9000, 13000, 17000]) * u.AA
    detection_rates_ = np.array([92, 230, 46]) * units.PHOTLAM * u.AA * u.cm**2
    dr_mock = MagicMock(return_value=(wavelengths_, detection_rates_))
    monkeypatch.setattr("nirwals.physics.exposure.detection_rates", dr_mock)

    # Calculate the detector counts.
    wavelengths, counts = electrons(
        area=area,
        exposures=exposures,
        exposure_time=exposure_time,
        grating_angle=grating_angle,
        grating_constant=grating_constant,
        observation=cast(Observation, observation),
    )

    # Sanity check: The correct parameter values were used.
    dr_mock.assert_called_once_with(
        area=area,
        grating_angle=grating_angle,
        grating_constant=grating_constant,
        observation=observation,
    )

    # Check that the calculated counts are correct.
    wavelength_values = wavelengths.to(u.AA).value
    wavelength_values_ = wavelengths_.to(u.AA).value
    count_values = counts.to(units.PHOTLAM * u.AA * u.cm**2 * u.s).value
    assert np.allclose(wavelength_values, wavelength_values_)
    expected_count_values = np.array([3 * 123 * 92, 3 * 123 * 230, 3 * 123 * 46])
    assert np.allclose(count_values, expected_count_values)


@pytest.mark.mpl_image_compare
def test_electrons() -> Figure:
    # Extract the required parameters from the default configuration.
    configuration = get_default_configuration()
    area = configuration.telescope.effective_mirror_area
    exposure = cast(Exposure, configuration.exposure)
    grating = cast(Grating, configuration.telescope.grating)

    # Get the source observation.
    source = source_observation(configuration)

    # Calculate the electron counts.
    wavelengths, counts = electrons(
        area=area,
        exposures=exposure.exposures,
        exposure_time=cast(Quantity, exposure.exposure_time),
        grating_angle=grating.grating_angle,
        grating_constant=grating.grating_constant,
        observation=source,
    )

    return create_matplotlib_figure(
        wavelengths, counts, title="Electron Counts", ylabel="Counts"
    )


def test_source_electron_values(monkeypatch: MonkeyPatch) -> None:
    # Define the relevant parameters.
    area = 543210 * u.cm**2
    exposures = 7
    exposure_time = 712 * u.s
    grating_angle = 56 * u.deg
    grating_constant = 1e-3 * u.mm
    configuration = get_default_configuration()
    configuration.telescope.effective_mirror_area = area
    grating = cast(Grating, configuration.telescope.grating)
    grating.grating_angle = grating_angle
    grating.name = cast(GratingName, "1000")
    exposure = cast(Exposure, configuration.exposure)
    exposure.exposures = exposures
    exposure.exposure_time = exposure_time
    wavelength_values = np.array([9000, 15000])
    electron_count_values = np.array([167, 89])

    # Patch the relevant functions.
    observation = _MockConstantObservation(flux=7 * units.PHOTLAM)
    source_observation = MagicMock(return_value=observation)
    monkeypatch.setattr(
        "nirwals.physics.exposure.source_observation", source_observation
    )
    electrons = MagicMock(
        return_value=(
            wavelength_values * u.AA,
            electron_count_values * u.dimensionless_unscaled,
        )
    )
    monkeypatch.setattr("nirwals.physics.exposure.electrons", electrons)

    # Sanity check: The relevant functions are called with the correct values.
    wavelengths, electron_counts = source_electrons(configuration)
    source_observation.assert_called_once_with(configuration)
    electrons.assert_called_once_with(
        area=area,
        exposures=exposures,
        exposure_time=exposure_time,
        grating_angle=grating_angle,
        grating_constant=grating_constant,
        observation=observation,
    )

    # Check that the calculated values are correct, i.e. the ones returned by the
    # electrons function.
    assert np.allclose(wavelengths.to(u.AA).value, wavelength_values)
    assert np.allclose(
        electron_counts.to(u.dimensionless_unscaled).value, electron_count_values
    )


@pytest.mark.mpl_image_compare
def test_source_electrons() -> Figure:
    configuration = get_default_configuration()
    wavelengths, electron_counts = source_electrons(configuration)

    return create_matplotlib_figure(
        wavelengths, electron_counts, title="Source Electrons", ylabel="Counts"
    )


def test_readout_noise() -> None:
    assert (
        pytest.approx(readout_noise(read_noise=5, samplings=3, sampling_mode="Fowler"))
        == 50 / 3
    )
    assert (
        pytest.approx(
            readout_noise(read_noise=8, samplings=5, sampling_mode="Up-the-Ramp")
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

    return create_matplotlib_figure(wavelengths, snr_values, title="SNR")


def test_exposure_time_value() -> None:
    # Create the required configuration.
    original_configuration = get_default_configuration()
    requested_exposures = 5
    requested_snr = 10
    requested_wavelength = 12345 * u.AA
    snr_ = SNR(
        snr=requested_snr,
        wavelength=requested_wavelength,
    )
    exposure = Exposure(exposures=requested_exposures, exposure_time=None, snr=snr_)
    configuration = dataclasses.replace(original_configuration, exposure=exposure)

    # Calculate the exposure times.
    snr_values, exposure_times = exposure_time(configuration)

    # Check that the correct SNR values were returned.
    assert len(snr_values) == 101
    assert pytest.approx(float(snr_values[0])) == 0
    assert pytest.approx(float(snr_values[50])) == requested_snr
    assert pytest.approx(float(snr_values[-1])) == 2 * requested_snr

    # We check for consistency: If we calculate the SNR for the exposure time at index
    # 50 (i.e. the one for the requested SNR), we should get the requested SNR again.
    exposure_time_for_requested_exposure = exposure_times[50]
    exposure2 = Exposure(
        exposures=requested_exposures,
        exposure_time=exposure_time_for_requested_exposure,
        snr=None,
    )
    configuration2 = dataclasses.replace(original_configuration, exposure=exposure2)
    wavelengths, snr_values = snr(configuration2)
    snr_spectrum = SpectralElement(
        Empirical1D, points=wavelengths, lookup_table=snr_values
    )
    snr_value = float(snr_spectrum(requested_wavelength))
    requested_snr_value = float(requested_snr)
    assert pytest.approx(snr_value) == requested_snr_value


@pytest.mark.mpl_image_compare
def test_exposure_time() -> Figure:
    # Create the required configuration.
    original_configuration = get_default_configuration()
    requested_exposures = 5
    requested_snr = 10
    requested_wavelength = 12345 * u.AA
    snr_ = SNR(
        snr=requested_snr,
        wavelength=requested_wavelength,
    )
    exposure = Exposure(exposures=requested_exposures, exposure_time=None, snr=snr_)
    configuration = dataclasses.replace(original_configuration, exposure=exposure)

    # Calculate the exposure times.
    snr_values, exposure_times = exposure_time(configuration)

    return create_matplotlib_figure(
        snr_values,
        exposure_times,
        left=0,
        right=float(snr_values[-1]),
        title="Exposure Time",
    )
