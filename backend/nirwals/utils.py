from functools import lru_cache

import numpy as np
from specutils.manipulation import SplineInterpolatedResampler
from astropy import units as u
from specutils import Spectrum1D


NUMBER_OF_POINTS = 40001
conv = {
    0: lambda x: float(x),  # conversion fn for column 0
    1: lambda x: float(x),  # conversion fn for column 1
}


def get_redshifted_spectrum(wavelength, flux, redshift: float):
    wavelength = wavelength * (1 + redshift)
    flux = flux / (1 + redshift)

    return wavelength, flux


#  TODO Caching should be done Correctly
@lru_cache
def read_csv_file(filename):
    spectra_data = np.loadtxt(filename, delimiter=",",  quotechar="|",  converters=conv)
    wavelength = spectra_data[:, 0]
    flux = spectra_data[:, 1]
    return wavelength, flux


def resampler(
        input_spectrum: Spectrum1D,
        minimum_wavelength=9000,
        maximum_wavelength=17000,
        number_of_points=NUMBER_OF_POINTS
):
    wavelength_range = np.linspace(minimum_wavelength, maximum_wavelength, number_of_points) * u.AA
    return SplineInterpolatedResampler()(input_spectrum, wavelength_range)
