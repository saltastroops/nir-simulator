import math

from astropy import units as u

from constants import FIBRE_RADIUS, TELESCOPE_FOCAL_LENGTH, COLLIMATOR_FOCAL_LENGTH


def wavelength_resolution_element(
    grating_constant: u.micron, grating_angle: u.deg
) -> u.AA:
    """
    Return the wavelength resolution element for a grating setup.

    Parameters
    ----------
    grating_constant: Quantity
        The grating constant, i.e. the groove spacing.
    grating_angle: Angle
        The grating angle, i.e. the angle of the incoming rays to the grating normal.

    Returns
    -------
    Quantity
        The wavelength resolution element.
    """
    # Angle of a fibre on the sky, in radians
    phi_fibre = 2 * FIBRE_RADIUS.to(u.rad).value

    return (
        phi_fibre
        * (TELESCOPE_FOCAL_LENGTH / COLLIMATOR_FOCAL_LENGTH)
        * grating_constant
        * math.cos(grating_angle.to(u.rad).value)
    )
