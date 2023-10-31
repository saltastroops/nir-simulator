
def get_redshifted_spectrum(wavelength, flux, redshift: float):
    wavelength = wavelength * (1 + redshift)
    flux = flux / (1 + redshift)

    return wavelength, flux
