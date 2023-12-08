import pytest
from astropy import units as u
from synphot import units

from nirwals.physics.utils import read_from_file
from nirwals.tests.utils import get_default_datafile


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
