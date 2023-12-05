from typing import cast, get_args

from astropy import units as u
from synphot import (
    BlackBodyNorm1D,
    SourceSpectrum,
    GaussianFlux1D,
    ConstFlux1D,
    units,
    Empirical1D,
)

from constants import get_file_base_dir
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


@u.quantity_input
def _blackbody(temperature: u.K, magnitude: float) -> SourceSpectrum:
    return SourceSpectrum(BlackBodyNorm1D, temperature=temperature)


@u.quantity_input
def _emission_line(
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
    filename = f"{age}_{galaxy_type}_type_{'emission' if with_emission_lines else 'no_emission'}.csv"
    file_path = (
        get_file_base_dir() / "data_sheets" / "adjusted_program_datasheets" / filename
    )
    with open(file_path, "rb") as f:
        wavelengths, fluxes = read_from_file(f, unit=units.FLAM)

    return SourceSpectrum(Empirical1D, points=wavelengths, lookup_table=fluxes)


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
