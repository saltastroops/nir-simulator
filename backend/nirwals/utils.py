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
        disp_grid_min=9000,
        disp_grid_max=17000,
        number_of_points=NUMBER_OF_POINTS
):
    disp_grid = np.linspace(disp_grid_min, disp_grid_max, number_of_points) * u.AA
    resampler = FluxConservingResampler()
    return resampler(input_spectrum, disp_grid)

