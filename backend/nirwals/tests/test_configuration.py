import pytest
from astropy import units as u

from nirwals.configuration import Grating


def test_grating() -> None:
    grating = Grating(grating_angle=45 * u.deg, name="950")
    assert pytest.approx(grating.grating_constant.to(u.mm).value) == 1 / 950
