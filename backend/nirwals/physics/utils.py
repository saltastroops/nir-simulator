from typing import Tuple, BinaryIO

import numpy as np
from astropy import units as u
from astropy.io import ascii
from astropy.units import Unit, Quantity


@u.quantity_input
def read_from_file(file: BinaryIO, unit: Unit) -> Tuple[Quantity, Quantity]:
    """
    Read wavelengths and corresponding values from a file.

    The file must be a table file which can be parsed by AstroPys ASCII reader. Its
    first row must contain the column names.

    The first column must contain wavelength values, which are supposed to be given in
    Angstrom. The values in the second column are supposed to be given in the unit
    specified by the unit parameter. If the file contains more than two columns, all
    columns other than the first and second one are ignored.

    The wavelengths in the first column are supposed to be sorted in ascending order,
    but this is not checked.

    If the minimum wavelength defined in the file is greater than 1 A (or, more
    precisely, greater than 1.02 A), it is assumed that below the minimum wavelength in
    the file the values drop to 0 within 0.01 A, and the wavelength and value array are
    extended accordingly.

    Similarly, if the maximum wavelength defined in the file is greater than 50000 A,
    it is assumed that above the maximum wavelength the file the values drop to 0 within
    0.01 A, and the wavelength and value array are extended accordingly.

    These extensions ensure that the data returned by this function can safely be used
    across the whole wavelength range used by NIRWALS, even if the file data cover only
    part of that range.

    Parameters
    ----------
    file: BinaryIO
        The data file.
    unit: Unit
        The unit to use for the values in the file's second column.

    Returns
    -------
    tuple of Quantity
        The wavelengths and corresponding values.
    """

    # Read in the data from the file
    data = ascii.read(file)

    # Extract the wavelengths and values from the table returned by the ASCII reader.
    wavelengths = np.array(data[data.colnames[0]])
    values = np.array(data[data.colnames[1]])

    # Assume the value is 0 for wavelengths not covered by the data file.
    if wavelengths[0] > 1.02:
        wavelengths = np.concatenate(
            (np.array([1, wavelengths[0] - 0.01]), wavelengths)
        )
        values = np.concatenate((np.array([0, 0]), values))
    if wavelengths[-1] < 50000:
        wavelengths = np.concatenate(
            (wavelengths, np.array([wavelengths[-1] + 0.01, 50000]))
        )
        values = np.concatenate((values, np.array([0, 0])))

    return wavelengths * u.AA, values * unit
