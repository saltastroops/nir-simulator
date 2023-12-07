import os
import pathlib

from astropy import units as u


FIBRE_RADIUS = 0.665 * u.arcsec
"""
Fibre radius, as an angle on the sky.
"""


FLUX = u.def_unit("TOTALFLAM", 1 * u.erg / (u.cm**2 * u.s))
"""
Unit for a total energy flux.
"""

TELESCOPE_SEEING = 0.6 * u.arcsec
"""
Telescope seeing, as an angle on the sky.
"""


ZERO_MAGNITUDE_FLUX = 9.3905625e-7 * u.erg / (u.cm**2 * u.s)
"""
Zero magnitude flux in the J band.
"""


def get_file_base_dir() -> pathlib.Path:
    """
    Return the base directory for the data files.

    Returns
    -------
    Path
        The base directory for the data files.
    """

    return pathlib.Path(os.environ["FILE_BASE_DIR"])


def get_minimum_wavelength() -> u.AA:
    """
    Return the minimum wavelength supported by NIRWALS.

    Returns
    -------
    Quantity
        The minimum wavelength supported by NIRWALS.
    """
    return 8000 * u.AA


def get_maximum_wavelength() -> u.AA:
    """
    Return the maximum wavelength supported by NIRWALS.

    Returns
    -------
    Quantity
        The maximum wavelength supported by NIRWALS.
    """
    return 17000 * u.AA
