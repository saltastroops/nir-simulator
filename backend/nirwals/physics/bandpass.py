import math
import pathlib
from typing import get_args

import numpy as np
from astropy import units as u
from synphot import SpectralElement, Empirical1D

from constants import get_file_base_dir
from nirwals.configuration import Grating, Filter
from nirwals.physics.utils import read_from_file


@u.quantity_input
def atmospheric_transmission(zenith_distance: u.deg) -> SpectralElement:
    """
    Return the atmospheric transmission curve for a given zenith distance.
    Parameters
    ----------
    zenith_distance: Angle
        Zenith distance.

    Returns
    -------
    SpectralElement
        The transmission curve.
    """
    # Get the extinction coefficients.
    path = pathlib.Path(get_file_base_dir() / "atmospheric_extinction_coefficients.csv")
    with open(path, "rb") as f:
        wavelengths, kappa_values = read_from_file(f)

    # Calculate the transmission values.
    sec_z = 1 / math.cos(zenith_distance.to(u.rad).value)
    transmissions = np.power(10, -0.4 * kappa_values * sec_z)

    # Return the extinction.
    return SpectralElement(Empirical1D, points=wavelengths, lookup_table=transmissions)


def filter_transmission(filter_name: Filter) -> SpectralElement:
    """
    Return the transmission curve for a given filter.
    Parameters
    ----------
    filter_name: Filter
        Filter name.

    Returns
    -------
    SpectralElement
        The filter transmission curve.
    """
    # Sanity check
    match filter_name:
        case "Clear":
            filename = "clear_filter_transmission.csv"
        case "LWBF":
            filename = "lwbf_transmission.csv"
        case _:
            raise ValueError(f"Unsupported filter: {filter_name}")

    # Get the filter transmission.
    path = pathlib.Path(get_file_base_dir() / "filters" / filename)
    with open(path, "rb") as f:
        wavelengths, transmissions = read_from_file(f)
    return SpectralElement(Empirical1D, points=wavelengths, lookup_table=transmissions)


@u.quantity_input
def grating_efficiency(grating: Grating, alpha: u.deg) -> SpectralElement:
    """
    Returns the grating efficiency for a given grating angle.

    The grating angle is the angle between the incoming light rays and the grating
    normal.

    Parameters
    ----------
    grating: Grating
        Grating name. This is equal to the grating frequency, i.e. grooves per mm.
    alpha: Angle
        Grating angle.

    Returns
    -------
    SpectralElement
        The grating efficiency.

    """

    import numpy as np

    # Grating angles for which a grating efficiency file exists and the wavelengths for
    # the maxima of the corresponding grating efficiency curves.
    grating_parameters = [
        (30 * u.deg, 10795.6 * u.AA),
        (35 * u.deg, 12081.6 * u.AA),
        (40 * u.deg, 13400.4 * u.AA),
        (45 * u.deg, 14700.0 * u.AA),
        (50 * u.deg, 15907.2 * u.AA),
    ]
    angles = [gp[0] for gp in grating_parameters]
    maxima = {gp[0]: gp[1] for gp in grating_parameters}

    # Avoid rounding issues.
    eps = 0.000001
    if angles[0] - eps * u.deg < alpha < angles[0] + eps * u.deg:
        alpha = angles[0] + eps * u.deg
    if angles[-1] - eps * u.deg < alpha < angles[-1] + eps * u.deg:
        alpha = angles[-1] - eps * u.deg

    # Find the smallest interval [alpha1, alpha2] in angles with
    # alpha1 <= alpha <= alpha2.
    if angles[0] > alpha or alpha > angles[-1]:
        raise ValueError(
            f"Only grating angles between {angles[0]} and {angles[1]} are "
            f"supported."
        )
    alpha1 = max([a for a in angles if a <= alpha])
    alpha2 = min([a for a in angles if alpha < a])

    # Figure out whether to shift the efficiency curve for alpha1 to the right or the
    # curve for alpha2 to the left.
    if alpha <= (alpha1 + alpha2) / 2:
        angle = alpha1
        shift_to_right = True
    else:
        angle = alpha2
        shift_to_right = False

    # Get the efficiency curve to shift.
    angle_value = round(angle.to(u.deg).value)
    path = pathlib.Path(
        get_file_base_dir()
        / "gratings"
        / grating
        / f"grating_{grating}_{angle_value}deg.csv"
    )
    with open(path, "rb") as f:
        wavelengths_, efficiencies_ = read_from_file(f)
    efficiency = SpectralElement(
        Empirical1D, points=wavelengths_, lookup_table=efficiencies_
    )

    # Perform the shift
    lmax1 = maxima[alpha1]
    lmax2 = maxima[alpha2]
    if shift_to_right:
        shift = -((alpha - alpha1) / (alpha2 - alpha1)) * (lmax2 - lmax1)
    else:
        shift = ((alpha2 - alpha) / (alpha2 - alpha1)) * (lmax2 - lmax1)
    wavelengths = np.arange(4000, 22000, 0.2) * u.AA
    shifted_wavelengths = wavelengths + shift
    shifted_efficiencies = efficiency(shifted_wavelengths)

    # Return the grating efficiency.
    return SpectralElement(
        Empirical1D, points=wavelengths, lookup_table=shifted_efficiencies
    )
