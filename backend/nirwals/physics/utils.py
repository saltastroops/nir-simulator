from typing import Tuple, BinaryIO

import numpy as np
from astropy import units as u
from astropy.units import Unit, Quantity


def read_from_file(
    file: BinaryIO, unit: Unit = u.dimensionless_unscaled
) -> Tuple[Quantity, Quantity]:
    """
    Read wavelengths and corresponding values from a file.

    The file must be in Numpy's .npz format, abd it must contain arrays called "x" and
    "y". The x array is used for the wavelengths, which are supposed to be given in
    Angstrom. The values in the y array are supposed to be given in the unit specified
    by the unit parameter. If no unit is given, the values are assumed to be
    dimensionless.

    The wavelengths in the x array are supposed to be sorted in ascending order, but
    this is not checked.

    If the minimum wavelength defined in the file is greater than 1 A (or, more
    precisely, greater than 1.02 A), it is assumed that below the minimum wavelength in
    the file the values drop to 0 within 0.01 A, and the wavelength and value array are
    extended accordingly.

    Similarly, if the maximum wavelength defined in the file is less than 50000 A, it is
    assumed that above the maximum wavelength the file the values drop to 0 within
    0.01 A, and the wavelength and value array are extended accordingly.

    These extensions ensure that the data returned by this function can safely be used
    across the whole wavelength range used by NIRWALS, even if the file data cover only
    part of that range.

    Use the numpyfy.py script for converting csv files into data files that can be used
    with this function.

    Parameters
    ----------
    file: BinaryIO
        The data file, in .npz format.
    unit: Unit, optional
        The unit to use for the values in the file's y array.

    Returns
    -------
    tuple of Quantity
        The wavelengths and corresponding values.
    """

    # Read in the data from the file
    npzfile = np.load(file)

    # Extract the wavelengths and values from the table returned by the ASCII reader.
    wavelengths = npzfile["x"]
    values = npzfile["y"]

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


def shift(a: np.ndarray, k: int) -> np.ndarray:
    """
    Shift an array by k places.

    A negative shift is to the left, a positive shift is to the right. "Gaps" resulting
    from the shift are filled with zeroes.

    Parameters
    ----------
    a: np.ndarray
        Array to shift.
    k: int
        Size of the shift.

    Returns
    -------
    np.ndarray
        The shifted array.
    """
    shifted_a = np.roll(a, k)
    if k < 0:
        shifted_a[k:] = 0
    if k > 0:
        shifted_a[:k] = 0

    return shifted_a
