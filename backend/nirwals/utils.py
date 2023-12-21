from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
from specutils.manipulation import LinearInterpolatedResampler
from astropy import units as u
from specutils import Spectrum1D

from constants import get_minimum_wavelength, get_maximum_wavelength


MAX_NUM_PLOT_POINTS = 401


def prepare_spectrum_plot_values(
    wavelengths: u.AA, y: u.Quantity, y_units: u.Unit
) -> tuple[list[float], list[float]]:
    """
    Prepare values fior plotting in a plot of some quantity over wavelength.

    The function takes three arguments: An array of wavelengths, an array of dependent
    ("y") values, and the units in which the dependent values should be plotted.

    All wavelengths outside the range from the minimum to the maximum supported
    wavelength are ignored. If the remaining array is still longer than the maximum
    number m of points to include in a plot, the wavelengths are resampled to m
    equidistant wavelengths from the minimum to the maximum supported wavelength.
    Linear interpolation is used to calculate the corresponding y values.

    The resulting wavelengths and y values are returned as Python lists. They are
    given in Angstrom (for the wavelengths) and the units specified by the y_units
    argument (for the y values).

    Parameters
    ----------
    wavelengths: Quantity
        The wavelengths.
    y: Quantity
        The dependent values
    y_units: astropy.unit.Unit
        The units in which the dependent values should be plotted.

    Returns
    -------
    tuple of lists of floats
        The wavelengths (in Angstrom) and dependent values (in the units specified by
        y_units) to plot.
    """
    # Convert the data to floats.
    wavelength_values = wavelengths.to(u.AA).value
    y_values = y.to(y_units).value

    # Only keep values within the desired wavelength range. We include a "grace range"
    # of 1 Angstrom at each boundary.
    min_wavelength = get_minimum_wavelength().to(u.AA).value - 1
    max_wavelength = get_maximum_wavelength().to(u.AA).value + 1
    within_range = (wavelength_values >= min_wavelength) & (
        wavelength_values <= max_wavelength
    )
    xs = wavelength_values[within_range]
    ys = y_values[within_range]

    max_num_points = MAX_NUM_PLOT_POINTS
    if len(xs) > max_num_points:
        # If there are too many wavelengths, downsample the points, using linear
        # interpolation for the resampling.
        resampled_xs = np.linspace(xs[0], xs[-1], max_num_points)
        resampled_ys = np.interp(resampled_xs, xs, ys)
        return resampled_xs.tolist(), resampled_ys.tolist()
    else:
        # No resampling is necessary.
        return xs.tolist(), ys.tolist()
