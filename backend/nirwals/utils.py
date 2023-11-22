import numpy as np
from specutils.manipulation import FluxConservingResampler
from astropy import units as u
from specutils import Spectrum1D


NUMBER_OF_POINTS = 40001


def get_redshifted_spectrum(wavelength, flux, redshift: float):
    wavelength = wavelength * (1 + redshift)
    flux = flux / (1 + redshift)

    return wavelength, flux


def resample_spectrum(
        input_spectrum: Spectrum1D,
        minimum_wavelength=9000,
        maximum_wavelength=17000,
        number_of_points=NUMBER_OF_POINTS
):
    wavelength_range = np.linspace(minimum_wavelength, maximum_wavelength, number_of_points) * u.AA
    resampler = FluxConservingResampler()
    return resampler(input_spectrum, wavelength_range)

