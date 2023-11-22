import numpy as np
from specutils.manipulation import FluxConservingResampler
from astropy import units as u
from specutils import Spectrum1D


NUMBER_OF_POINTS = 40001


def get_redshifted_spectrum(wavelength, flux, redshift: float):
    wavelength = wavelength * (1 + redshift)
    flux = flux / (1 + redshift)

    return wavelength, flux


def resample_spectrum(input_spectrum: Spectrum1D):
    wavelength_range = np.linspace(9000, 15000, NUMBER_OF_POINTS) * u.AA
    new_disp_grid = wavelength_range * u.AA
    resampler = FluxConservingResampler()
    return resampler(input_spectrum, new_disp_grid)

