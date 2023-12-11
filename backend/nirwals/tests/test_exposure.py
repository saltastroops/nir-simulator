import math
from typing import cast
from unittest.mock import MagicMock

import pytest
from astropy import units as u
from matplotlib.figure import Figure
from pytest import MonkeyPatch
from synphot import SourceSpectrum, ConstFlux1D, units, SpectralElement

from constants import get_minimum_wavelength, get_maximum_wavelength
from nirwals.configuration import Source, Grating
from nirwals.physics.exposure import (
    wavelength_resolution_element,
    pixel_wavelength_range,
    source_observation,
    sky_observation,
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


def test_wavelength_resolution_element(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr("nirwals.physics.exposure.FIBRE_RADIUS", 2 * u.arcsec)
    monkeypatch.setattr("nirwals.physics.exposure.TELESCOPE_FOCAL_LENGTH", 50 * u.m)
    monkeypatch.setattr("nirwals.physics.exposure.COLLIMATOR_FOCAL_LENGTH", 0.75 * u.m)
    grating_constant = 2 * u.um
    grating_angle = 60 * u.deg

    dlambda = wavelength_resolution_element(grating_constant, grating_angle)
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
