import numpy as np
from specutils.manipulation import FluxConservingResampler
from astropy import units as u
from specutils import Spectrum1D


def get_redshifted_spectrum(wavelength, flux, redshift: float):
    wavelength = wavelength * (1 + redshift)
    flux = flux / (1 + redshift)

    return wavelength, flux


def resample_spectrum(input_spectrum: Spectrum1D):
    num_points = 40001
    wavelength_range = np.array([9000 + i / 5 for i in range(num_points)])
    new_disp_grid = wavelength_range * u.AA
    resampler = FluxConservingResampler()
    return resampler(input_spectrum, new_disp_grid)

