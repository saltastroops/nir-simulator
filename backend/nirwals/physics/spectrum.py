import pathlib
from typing import cast, get_args

from astropy import units as u
from synphot import (
    BlackBodyNorm1D,
    SourceSpectrum,
    GaussianFlux1D,
    ConstFlux1D,
    units,
    Empirical1D,
    SpectralElement,
)

from constants import get_file_base_dir, FLUX, ZERO_MAGNITUDE_FLUX
from nirwals.configuration import (
    Configuration,
    Spectrum,
    Blackbody,
    EmissionLine,
    GalaxyType,
    GalaxyAge,
    Galaxy,
)
from nirwals.physics.utils import read_from_file


def normalize(spectrum: SourceSpectrum, magnitude: float) -> SourceSpectrum:
    """
    Normalize a source spectrum to have given Johnson J magnitude.

    The `waveset` property must be defined for the given source spectrum.

    Parameters
    ----------
    spectrum : SourceSpectrum
        The source spectrum to normalize.
    magnitude : float
        The magnitude the normalized spectrum should have.

    Returns
    -------
    SourceSpectrum
        The normalized spectrum.
    """
    # Get the total non-normalised flux in the J band.
    J = SpectralElement.from_filter("johnson_j")
    F = (J * spectrum).integrate(flux_unit=units.FLAM)

    # Get the total (normalised) flux for the given magnitude.
    F_m = 10 ** (-0.4 * magnitude) * ZERO_MAGNITUDE_FLUX

    # Normalise the spectrum.
    normalisation_factor = float(F_m / F)
    return normalisation_factor * spectrum


@u.quantity_input
def _blackbody(temperature: u.K, magnitude: float) -> SourceSpectrum:
    spectrum = SourceSpectrum(BlackBodyNorm1D, temperature=temperature)
    return normalize(spectrum, magnitude)


@u.quantity_input
def _emission_line(
    central_wavelength: u.AA,
    fwhm: u.AA,
    redshift: float,
    total_flux: FLUX,
) -> SourceSpectrum:
    return SourceSpectrum(
        GaussianFlux1D,
        total_flux=total_flux,
        mean=central_wavelength,
        fwhm=fwhm,
        z=redshift,
        z_type="conserve_flux",
    )


def _galaxy(
    age: GalaxyAge,
    galaxy_type: GalaxyType,
    magnitude: float,
    redshift: float,
    with_emission_lines: bool,
) -> SourceSpectrum:
    # Sanity checks
    if age not in get_args(GalaxyAge):
        raise ValueError(f"Unsupported galaxy age: {age}")
    if galaxy_type not in get_args(GalaxyType):
        raise ValueError(f"Unsupported galaxy type: {galaxy_type}")

    # Read in the galaxy spectrum from the relevant file.
    filename = (
        f"{age}_{galaxy_type}_type_"
        f"{'emission' if with_emission_lines else 'no_emission'}.csv"
    )
    file_path = get_file_base_dir() / "galaxies" / filename
    with open(file_path, "rb") as f:
        wavelengths, fluxes = read_from_file(f, unit=units.FLAM)

    spectrum = SourceSpectrum(
        Empirical1D,
        points=wavelengths,
        lookup_table=fluxes,
        z=redshift,
        z_type="conserve_flux",
    )
    return normalize(spectrum, magnitude)


def _spectrum(spectrum: Spectrum) -> SourceSpectrum:
    if type(spectrum) == Blackbody:
        bb = cast(Blackbody, spectrum)
        return _blackbody(temperature=bb.temperature, magnitude=bb.magnitude)
    elif type(spectrum) == EmissionLine:
        el = cast(EmissionLine, spectrum)
        return _emission_line(
            central_wavelength=el.central_wavelength,
            fwhm=el.fwhm,
            redshift=el.redshift,
            total_flux=el.total_flux,
        )
    elif type(spectrum) == Galaxy:
        g = cast(Galaxy, spectrum)
        return _galaxy(
            age=g.age,
            galaxy_type=g.galaxy_type,
            magnitude=g.magnitude,
            redshift=g.redshift,
            with_emission_lines=g.with_emission_lines,
        )

    raise ValueError(f"Unsupported spectrum type: {type(spectrum)}")


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


def sky_spectrum():
    """
    Return the sky background.

    Returns
    -------
    SourceSpectrum
        The sky background.
    """
    path = pathlib.Path(
        get_file_base_dir()
        / "data_sheets"
        / "adjusted_program_datasheets"
        / "1-1-nirsky.csv"
    )
    with open(path, "rb") as f:
        wavelengths, fluxes = read_from_file(f, units.PHOTLAM)

    return SourceSpectrum(Empirical1D, points=wavelengths, lookup_table=fluxes)
