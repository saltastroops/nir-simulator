import numpy as np
import pytest
from astropy import units as u
from astropy.units import Quantity

from nirwals.configuration import Grating
from nirwals.physics.bandpass import grating_efficiency
from nirwals.tests.utils import create_matplotlib_figure


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
