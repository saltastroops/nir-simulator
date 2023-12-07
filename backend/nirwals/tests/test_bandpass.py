import math
from typing import get_args

import numpy as np
import pytest
from astropy import units as u
from astropy.units import Quantity

from nirwals.configuration import Grating, Filter
from nirwals.physics.bandpass import (
    grating_efficiency,
    atmospheric_transmission,
    filter_transmission,
)
from nirwals.tests.utils import create_matplotlib_figure


@pytest.mark.mpl_image_compare
def test_atmospheric_transmission():
    zenith_distance = 31 * u.deg
    extinction = atmospheric_transmission(zenith_distance)
    wavelengths = extinction.waveset
    extinction_values = extinction(wavelengths)
    return create_matplotlib_figure(
        wavelengths,
        extinction_values,
        title=f"Atmospheric Extinction (zenith distance {zenith_distance})",
    )


def test_atmospheric_transmission_zenith_distance_dependency():
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
@pytest.mark.parametrize("filter_name", get_args(Filter))
def test_filter_transmission(filter_name: Filter):
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
def test_grating_efficiency(alpha: u.deg):
    grating: Grating = "950"
    efficiency = grating_efficiency(grating=grating, alpha=alpha)

    wavelengths = efficiency.waveset
    efficiencies = efficiency(wavelengths)
    return create_matplotlib_figure(
        wavelengths,
        efficiencies,
        title=f"Grating Efficiency ({grating} lines/mm, alpha={alpha})",
    )


def test_grating_efficiency_interpolation():
    # Efficiencies for 40, 41, 43, 45 degrees
    efficiencies = {
        alpha: grating_efficiency(grating="950", alpha=alpha)
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
