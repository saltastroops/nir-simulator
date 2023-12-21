import numpy as np
import pytest
from _pytest.monkeypatch import MonkeyPatch
from astropy import units as u
from synphot import units

from nirwals.physics.utils import read_from_file, shift
from nirwals.tests.utils import get_default_datafile
from nirwals.utils import prepare_spectrum_plot_values, MAX_NUM_PLOT_POINTS


def test_read_from_file() -> None:
    wavelengths, values = read_from_file(file=get_default_datafile(), unit=units.FLAM)

    wavelengths = wavelengths.to(u.AA).value
    values = values.to(units.FLAM).value

    assert pytest.approx(wavelengths[0]) == 1
    assert pytest.approx(wavelengths[1]) == 999.99
    assert pytest.approx(wavelengths[2]) == 1000
    assert pytest.approx(wavelengths[3]) == 2000
    assert pytest.approx(wavelengths[4]) == 3000
    assert pytest.approx(wavelengths[5]) == 3000.01
    assert pytest.approx(wavelengths[6]) == 50000

    assert pytest.approx(values[0]) == 0
    assert pytest.approx(values[1]) == 0
    assert pytest.approx(values[2]) == 1
    assert pytest.approx(values[3]) == 1
    assert pytest.approx(values[4]) == 1
    assert pytest.approx(values[5]) == 0
    assert pytest.approx(values[6]) == 0


def test_shift() -> None:
    a = np.arange(1, 11)
    assert np.array_equal(shift(a, 0), a)
    assert np.array_equal(shift(a, 1), np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
    assert np.array_equal(shift(a, 5), np.array([0, 0, 0, 0, 0, 1, 2, 3, 4, 5]))
    assert np.array_equal(shift(a, -1), np.array([2, 3, 4, 5, 6, 7, 8, 9, 10, 0]))
    assert np.array_equal(shift(a, -3), np.array([4, 5, 6, 7, 8, 9, 10, 0, 0, 0]))


def test_prepare_spectrum_plot_values_no_resampling(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr("nirwals.utils.get_minimum_wavelength", lambda: 10000 * u.AA)
    monkeypatch.setattr("nirwals.utils.get_maximum_wavelength", lambda: 14000 * u.AA)

    wavelengths = (
        np.array([9000, 9500, 9998.9, 10000, 12000, 14000, 14001.1, 16000]) * u.AA
    )
    counts = np.array([56, 42, 99, 16, 9, 77, 14, 84]) * u.photon
    xs, ys = prepare_spectrum_plot_values(wavelengths, counts, u.photon)

    assert xs == [10000, 12000, 14000]
    assert ys == [16, 9, 77]


def test_prepare_spectrum_plot_values_with_resampling(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr("nirwals.utils.get_minimum_wavelength", lambda: 10000 * u.AA)
    monkeypatch.setattr("nirwals.utils.get_maximum_wavelength", lambda: 14000 * u.AA)

    max_num_points = MAX_NUM_PLOT_POINTS
    wavelengths = np.linspace(9950, 14050, 6 * max_num_points) * u.AA
    counts = 2 * np.linspace(9950, 14050, 6 * max_num_points) * u.photon
    xs, ys = prepare_spectrum_plot_values(wavelengths, counts, u.photon)

    expected_ys = [2 * x for x in xs]

    assert len(xs) == max_num_points
    assert len(ys) == max_num_points
    assert 9999 < xs[0] < 10001
    assert 13999 < xs[-1] < 14001
    # Check that the points have the right distance from each other.
    assert pytest.approx(xs[1] - xs[0]) == (xs[-1] - xs[0]) / (max_num_points - 1)
    assert np.allclose(ys, expected_ys)
