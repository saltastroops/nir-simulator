import math
from typing import get_args, cast
from unittest.mock import MagicMock

import numpy as np
import pytest
from matplotlib.figure import Figure
from pytest import MonkeyPatch
from astropy import units as u
from astropy.units import Quantity
from synphot import SpectralElement, ConstFlux1D

from constants import TELESCOPE_SEEING, FIBRE_RADIUS
from nirwals.configuration import GratingName, Filter, SourceExtension, Source, Grating
from nirwals.physics.bandpass import (
    grating_efficiency,
    atmospheric_transmission,
    filter_transmission,
    telescope_throughput,
    detector_quantum_efficiency,
    fibre_throughput,
    throughput,
)
from nirwals.tests.utils import create_matplotlib_figure, get_default_configuration


@pytest.mark.mpl_image_compare
def test_atmospheric_transmission() -> Figure:
    zenith_distance = 31 * u.deg
    extinction = atmospheric_transmission(zenith_distance)
    wavelengths = extinction.waveset
    extinction_values = extinction(wavelengths)
    return create_matplotlib_figure(
        wavelengths,
        extinction_values,
        title=f"Atmospheric Transmission (zenith distance {zenith_distance})",
    )


def test_atmospheric_transmission_zenith_distance_dependency() -> None:
    # For the transmission t, extinction coefficient kappa and zenith distance z the
    # relation t = 10^(-0.4 kappa (sec(z2) - sec(z1))) holds. This implies that the
    # ratio lg(t2/t1) / (sec(z2) - sec(z1)) must be constant.

    zs = [28 * u.deg, 31 * u.deg, 32 * u.deg, 42 * u.deg]
    sec_zs = [1 / math.cos(z.to(u.rad).value) for z in zs]
    ts = [atmospheric_transmission(zenith_distance=z)(12000) for z in zs]
    ratio1 = math.log10(ts[1] / ts[0]) / (sec_zs[1] - sec_zs[0])
    ratio2 = math.log10(ts[3] / ts[2]) / (sec_zs[3] - sec_zs[2])

    assert pytest.approx(ratio1) == ratio2


@pytest.mark.mpl_image_compare
def test_detector_quantum_efficiency() -> Figure:
    efficiency = detector_quantum_efficiency()
    wavelengths = efficiency.waveset
    efficiencies = efficiency(wavelengths)
    return create_matplotlib_figure(
        wavelengths, efficiencies, title="Detector Quantum Efficiency"
    )


@pytest.mark.mpl_image_compare
@pytest.mark.parametrize("source_extension", get_args(SourceExtension))
def test_fibre_throughput(source_extension: SourceExtension) -> Figure:
    seeing = 2 * u.arcsec
    zenith_distance = 31 * u.deg
    throughput = fibre_throughput(
        seeing=seeing,
        source_extension=source_extension,
        zenith_distance=zenith_distance,
    )
    # No wavelengths are defined for the throughput object, so we define our own ones.
    wavelengths = np.linspace(8000, 18000, 100) * u.AA
    throughputs = throughput(wavelengths)

    return create_matplotlib_figure(
        wavelengths,
        throughputs,
        title=f"Fibre throughput ({source_extension}, seeing {seeing}, "
        f"zenith distance {zenith_distance})",
    )


def test_fibre_throughput_values() -> None:
    # In the following z denotes the zenith distance.
    # First let's consider z=0 and a seeing of 1 arcsec
    sigma_squared = ((1 * u.arcsec) ** 2 + TELESCOPE_SEEING**2) / (8 * math.log(2))
    expected_throughput = 1 - math.exp(-(FIBRE_RADIUS**2) / (2 * sigma_squared))
    throughput = fibre_throughput(1 * u.arcsec, "Point", 0 * u.arcsec)
    assert pytest.approx(float(throughput(12000 * u.AA))) == expected_throughput
    throughput = fibre_throughput(1 * u.arcsec, "Diffuse", 0 * u.arcsec)
    assert float(throughput(12000)) == 1

    # Now let us consider changes in z for a point source.
    # For the throughput t, fibre radius r, seeing s and standard deviation sigma we get
    # t = 1 - exp(-r^2 / (2 sigma^2)) and hence ln(1 - t) = -r^2 / (2 sigma^2). This
    # means that (with the telescope seeing 0.6")
    # ln(1 - t2) / ln(1 - t1) = sigma1^2 / sigma2^2
    #        = (s^2 (sec z1)^(6/5) + 0.6"^2) / (s^2 (sec z2)^(6/5) + 0.6"^2)
    s = 1 * u.arcsec
    z1 = 31 * u.deg
    z2 = 40 * u.deg
    sec_z1 = 1 / math.cos(z1.to(u.rad).value)
    sec_z2 = 1 / math.cos(z2.to(u.rad).value)
    t1 = float(fibre_throughput(s, "Point", z1)(12000))
    t2 = float(fibre_throughput(s, "Point", z2)(12000))
    ratio1 = math.log(1 - t2) / math.log(1 - t1)
    ratio2 = (s**2 * sec_z1 ** (6 / 5) + TELESCOPE_SEEING**2) / (
        s**2 * sec_z2 ** (6 / 5) + TELESCOPE_SEEING**2
    )

    assert pytest.approx(float(ratio1)) == float(ratio2)


def test_fibre_throughput_for_infinite_seeing() -> None:
    # There should be no through for a point source if the seeing is "infinite", but the
    # throughput for a diffuse source should still be 1.
    seeing = 10000 * u.arcsec
    zenith_distance = 35 * u.deg
    throughput = fibre_throughput(seeing, "Point", zenith_distance)
    assert float(throughput(12000)) < 1e-7
    throughput = fibre_throughput(seeing, "Diffuse", zenith_distance)
    assert float(throughput(12000)) == 1


def test_fibre_throughput_without_seeing(monkeypatch: MonkeyPatch) -> None:
    # If there is no seeing, the throughput is one for both point and diffuse sources.
    seeing = 1e-10 * u.arcsec
    monkeypatch.setattr("nirwals.physics.bandpass.TELESCOPE_SEEING", 0 * u.arcsec)
    zenith_distance = 35 * u.deg
    throughput = fibre_throughput(seeing, "Point", zenith_distance)
    assert pytest.approx(float(throughput(12000))) == 1
    throughput = fibre_throughput(seeing, "Diffuse", zenith_distance)
    assert float(throughput(12000)) == 1


@pytest.mark.mpl_image_compare
@pytest.mark.parametrize("filter_name", get_args(Filter))
def test_filter_transmission(filter_name: Filter) -> Figure:
    transmission = filter_transmission(filter_name)
    wavelengths = transmission.waveset
    transmissions = transmission(wavelengths)
    return create_matplotlib_figure(
        wavelengths, transmissions, title=f"Filter Transmission ({filter_name})"
    )


@pytest.mark.mpl_image_compare
@pytest.mark.parametrize(
    "alpha", [30 * u.deg, 35 * u.deg, 37.5 * u.deg, 40 * u.deg, 45 * u.deg, 50 * u.deg]
)
def test_grating_efficiency(alpha: u.deg) -> Figure:
    grating: GratingName = "950"
    efficiency = grating_efficiency(grating_angle=alpha, grating_name=grating)

    wavelengths = efficiency.waveset
    efficiencies = efficiency(wavelengths)
    return create_matplotlib_figure(
        wavelengths,
        efficiencies,
        title=f"Grating Efficiency ({grating} lines/mm, alpha={alpha})",
    )


def test_grating_efficiency_interpolation() -> None:
    # Efficiencies for 40, 41, 43, 45 degrees
    efficiencies = {
        alpha: grating_efficiency(grating_angle=alpha, grating_name="950")
        for alpha in [40 * u.deg, 41 * u.deg, 43 * u.deg, 45 * u.deg]
    }

    # Find the maxima (as wavelength-efficiency pairs).
    maxima: dict[Quantity, tuple[Quantity, Quantity]] = {}
    for alpha, efficiency in efficiencies.items():
        wavelengths_ = efficiency.waveset
        efficiencies_ = efficiency(wavelengths_)
        index_for_maximum = np.argmax(efficiencies_)
        wavelength_for_maximum = wavelengths_[index_for_maximum]
        efficiency_for_maximum = efficiencies_[index_for_maximum]
        maxima[alpha] = (wavelength_for_maximum, efficiency_for_maximum)

    # Collect the maximum values.
    lambda_max_40 = maxima[40 * u.deg][0]
    lambda_max_41 = maxima[41 * u.deg][0]
    lambda_max_43 = maxima[43 * u.deg][0]
    lambda_max_45 = maxima[45 * u.deg][0]
    eff_max_40 = maxima[40 * u.deg][1]
    eff_max_41 = maxima[41 * u.deg][1]
    eff_max_43 = maxima[43 * u.deg][1]
    eff_max_45 = maxima[45 * u.deg][1]

    # The maximum for 41 degrees should be located at 1/5 between the maxima for 40 and
    # 45 degrees, and it should have the same value as that for 40 degrees.
    lambda_max_41_expected = lambda_max_40 + 0.2 * (lambda_max_45 - lambda_max_40)
    eff_max_41_expected = eff_max_40
    assert (
        pytest.approx(lambda_max_41.to(u.AA).value, rel=1e-3)
        == lambda_max_41_expected.to(u.AA).value
    )
    assert pytest.approx(float(eff_max_41)) == float(eff_max_41_expected)

    # The maximum for 43 degrees should be located at 3/5 between the maxima for 40 and
    # 45 degrees, and it should have the same value as that for 45 degrees.
    lambda_max_43_expected = lambda_max_40 + 0.6 * (lambda_max_45 - lambda_max_40)
    eff_max_43_expected = eff_max_45
    assert (
        pytest.approx(lambda_max_43.to(u.AA).value, rel=1e-3)
        == lambda_max_43_expected.to(u.AA).value
    )
    assert pytest.approx(float(eff_max_43)) == float(eff_max_43_expected)


@pytest.mark.mpl_image_compare
def test_telescope_throughput() -> Figure:
    throughput = telescope_throughput()
    wavelengths = throughput.waveset
    throughputs = throughput(wavelengths)
    return create_matplotlib_figure(
        wavelengths, throughputs, title="Telescope Throughput"
    )


def test_throughput_value(monkeypatch: MonkeyPatch) -> None:
    # Mock values. Prime numbers are used so that multiplying different mock values is
    # guaranteed to yield different results.
    _MOCK_ATMOSPHERIC_TRANSMISSION = ("atmospheric_transmission", 5)
    _MOCK_TELESCOPE_THROUGHPUT = ("telescope_throughput", 7)
    _MOCK_FIBRE_THROUGHPUT = ("fibre_throughput", 11)
    _MOCK_FILTER_TRANSMISSION = ("filter_transmission", 13)
    _MOCK_GRATING_EFFICIENCY = ("grating_efficiency", 17)
    _MOCK_DETECTOR_QUANTUM_EFFICIENCY = ("detector_quantum_efficiency", 19)

    # Mock the various throughput components.
    mocks: dict[str, MagicMock] = dict()
    for m in (
        _MOCK_ATMOSPHERIC_TRANSMISSION,
        _MOCK_TELESCOPE_THROUGHPUT,
        _MOCK_FIBRE_THROUGHPUT,
        _MOCK_FILTER_TRANSMISSION,
        _MOCK_GRATING_EFFICIENCY,
        _MOCK_DETECTOR_QUANTUM_EFFICIENCY,
    ):
        mock = MagicMock(return_value=SpectralElement(ConstFlux1D, amplitude=m[1]))
        monkeypatch.setattr(f"nirwals.physics.bandpass.{m[0]}", mock)
        mocks[m[0]] = mock

    # Calculate the throughput.
    configuration = get_default_configuration()
    actual_throughput = throughput(configuration=configuration)

    # Check that all the throughput component functions have been called with the
    # correct arguments.
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

    # Check that the calculated throughput value is correct.
    expected_throughput = (
        _MOCK_ATMOSPHERIC_TRANSMISSION[1]
        * _MOCK_TELESCOPE_THROUGHPUT[1]
        * _MOCK_FIBRE_THROUGHPUT[1]
        * _MOCK_FILTER_TRANSMISSION[1]
        * _MOCK_GRATING_EFFICIENCY[1]
        * _MOCK_DETECTOR_QUANTUM_EFFICIENCY[1]
    )
    assert pytest.approx(float(actual_throughput(12345 * u.AA))) == expected_throughput


@pytest.mark.mpl_image_compare
def test_throughput() -> Figure:
    configuration = get_default_configuration()
    throughput_bandpass = throughput(configuration=configuration)
    wavelengths = throughput_bandpass.waveset
    throughputs = throughput_bandpass(wavelengths)

    return create_matplotlib_figure(wavelengths, throughputs, title="Throughput")
