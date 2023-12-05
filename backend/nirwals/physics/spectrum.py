from typing import cast

from astropy import units as u
from synphot import BlackBodyNorm1D, SourceSpectrum, GaussianFlux1D, ConstFlux1D, units

from nirwals.configuration import Configuration, Spectrum, Blackbody, EmissionLine


@u.quantity_input
def blackbody(temperature: u.K, magnitude: float) -> SourceSpectrum:
    return SourceSpectrum(BlackBodyNorm1D, temperature=temperature)


@u.quantity_input
def emission_line(
    central_wavelength: u.AA,
    fwhm: u.AA,
    redshift: float,
    total_flux: u.erg / (u.cm**2 * u.s),
) -> SourceSpectrum:
    return SourceSpectrum(
        GaussianFlux1D,
        total_flux=total_flux,
        mean=central_wavelength,
        fwhm=fwhm,
        z=redshift,
        z_type="conserve_flux",
    )


def galaxy() -> SourceSpectrum:
    pass


def _spectrum(spectrum: Spectrum):
    if type(spectrum) == Blackbody:
        bb = cast(Blackbody, spectrum)
        return blackbody(temperature=bb.temperature, magnitude=bb.magnitude)
    elif type(spectrum) == EmissionLine:
        el = cast(EmissionLine, spectrum)
        return emission_line(
            central_wavelength=el.central_wavelength,
            fwhm=el.fwhm,
            redshift=el.redshift,
            total_flux=el.total_flux,
        )


def source_spectrum(configuration: Configuration) -> SourceSpectrum:
    """
    Return the source spectrum for a given configuration.

    Parameters
    ----------
    configuration: Configuration
        The configuration.

    Returns
    -------
    SourceSpectrum
        The source spectrum.
    """

    summed_spectrum = SourceSpectrum(ConstFlux1D, amplitude=0 * units.PHOTLAM)
    for s in configuration.source.spectrum:
        summed_spectrum += _spectrum(s)

    return summed_spectrum
