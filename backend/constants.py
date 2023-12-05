import os
import pathlib

from astropy import units as u


FLUX = u.def_unit("TOTALFLAM", 1 * u.erg / (u.cm**2 * u.s))


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
