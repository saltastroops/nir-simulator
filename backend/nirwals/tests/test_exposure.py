import math

import pytest
from astropy import units as u
from pytest import MonkeyPatch

from nirwals.physics.exposure import wavelength_resolution_element


def test_wavelength_resolution_element(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setattr("nirwals.physics.exposure.FIBRE_RADIUS", 2 * u.arcsec)
    monkeypatch.setattr("nirwals.physics.exposure.TELESCOPE_FOCAL_LENGTH", 50 * u.m)
    monkeypatch.setattr("nirwals.physics.exposure.COLLIMATOR_FOCAL_LENGTH", 0.75 * u.m)
    grating_constant = 2 * u.um
    grating_angle = 60 * u.deg

    dlambda = wavelength_resolution_element(grating_constant, grating_angle)
    assert pytest.approx(dlambda.to(u.m).value) == (math.pi / 2.43) * 1e-9
