import dataclasses
from pathlib import Path

from astropy import units as u
from typing import Literal, NamedTuple

from astropy.coordinates import Angle
from astropy.units import Quantity


@dataclasses.dataclass
class Blackbody:
    """
    A blackbody configuration.

    Parameters
    ----------
    magnitude: float
        The apparent magnitude for a Johnson-J filter.
    temperature: Quantity
        The source temperature.
    """

    magnitude: float
    temperature: Quantity


@dataclasses.dataclass
class EmissionLine:
    """
    A Gaussian emission line configuration.

    Parameters
    ----------
    central_wavelength: Quantity
        The wavelength of the line center.
    fwhm: Quantity
        The full width half maximum.
    redshift: float
        The redshift z.
    total_flux: Quantity
        The total flux (integrated over the line).
    """

    central_wavelength: Quantity
    fwhm: Quantity
    redshift: float
    total_flux: Quantity


@dataclasses.dataclass
class Galaxy:
    """
    A galaxy spectrum configuration.

    Parameters
    ----------
    galaxy_type: str
        The type of galaxy, such as "E" or "Sb".
    magnitude: float
        The apparent magnitude for a Johnson-J filter.
    redshift: float
        The redshift z.
    with_emission_lines: bool
        Whether the spectrum should include emission lines.
    """

    age: Literal["Old", "Young"]
    galaxy_type: Literal["E", "S0", "Sa", "Sb", "Sc", "Sd"]
    magnitude: float
    redshift: float
    with_emission_lines: bool


@dataclasses.dataclass
class UserDefinedSpectrum:
    """
    A user-defined spectrum.

    Parameters
    ----------
    file: pathlib.Path
       Path to the CSV file with the wavelengths and fluxes.
    """

    file: Path


Spectrum = Blackbody | EmissionLine | Galaxy | UserDefinedSpectrum


@dataclasses.dataclass
class Moon:
    """
    Lunar properties.

    Parameters
    ----------
    lunar_elongation: Angle
        The lunar elongation, i.e. the angle between the source and the Moon.
    phase: Angle
        The lunar phase. 0 degrees corresponds to Full Moon, 180 degrees to New Moon.
    zenith_distance: Angle
        The zenith distance of the Moon.
    """

    lunar_elongation: Angle
    phase: Angle
    zenith_distance: Angle


@dataclasses.dataclass
class Sun:
    """
    Solar properties.

    Parameters
    ----------
    ecliptic_latitude: Angle
        The ecliptic latitude of the source.
    solar_elongation: Angle
        The solar elongation, i.e. the angle between the source and the Sun.
    year: int
        The year of observation.
    """

    ecliptic_latitude: Angle
    solar_elongation: Angle
    year: int


@dataclasses.dataclass
class Telescope:
    """
    Telescope properties.

    Parameters
    ----------
    effective_mirror_area: Quantity
        The effective telescope mirror area.
    grating_groove_frequency: Quantity
        The groove frequency ("lines per mm") of the grating.
    """

    effective_mirror_area: Quantity
    grating_angle: Quantity | None
    grating_groove_frequency: Quantity | None


@dataclasses.dataclass
class Source:
    """
    A source configuration.

    extension: str
        The source extension ("Diffuse" or "Point").
    spectrum: list of Spectrum
        The source spectrum, as a list of its constituent spectra.
    zenith_distance: Angle
        The zenith distance of the source.
    """

    extension: Literal["Diffuse", "Point"]
    spectrum: list[Spectrum]
    zenith_distance: Angle


@dataclasses.dataclass
class Configuration:
    """
    A configuration.

    Parameters
    ----------
    moon: Moon
        The lunar properties.
    seeing: Angle
        The full width half maximum of the seeing disk for atmospheric seeing measured
        in the direction of the zenith.
    source: Source
        The source configuration.
    sun: Sun
        The solar properties.
    telescope: Telescope
        The telescope configuration.
    """

    moon: Moon
    seeing: Angle
    source: Source
    sun: Sun
    telescope: Telescope


def configuration(data: dict) -> Configuration:
    """
    Return the configuration defined in the given POST data.

    Parameters
    ----------
    data: dict
       Configuration data, as included in the POST request.

    Returns
    -------
    Configuration
        The configuration.
    """

    source_extension = data["source"]["type"]
    spectrum_parts = []
    for s in data["source"]["spectrum"]:
        spectrum_type = s["spectrumType"]
        match spectrum_type:
            case "Blackbody":
                spectrum = Blackbody(
                    magnitude=float(s["magnitude"]),
                    temperature=float(s["temperature"]) * u.K,
                )
            case "Emission Line":
                spectrum = EmissionLine(
                    central_wavelength=float(s["centralWavelength"]) * u.AA,
                    fwhm=float(s["fwhm"]) * u.AA,
                    redshift=float(s["redshift"]),
                    total_flux=float(s["flux"]) * u.erg / (u.cm**2 * u.s),
                )
            case "Galaxy":
                spectrum = Galaxy(
                    age=s["age"],
                    galaxy_type=s["type"],
                    magnitude=float(s["magnitude"]),
                    redshift=float(s["redshift"]),
                    with_emission_lines=False,
                )
            case other:
                raise ValueError(f"Unsupported spectrum type: {spectrum_type}")

        spectrum_parts.append(spectrum)

    moon = Moon(
        lunar_elongation=float(data["moon"]["lunarElongation"]) * u.deg,
        phase=float(data["moon"]["phase"]) * u.deg,
        zenith_distance=float(data["moon"]["zenithDistance"]) * u.deg,
    )
    sun = Sun(
        ecliptic_latitude=float(data["sun"]["eclipticLatitude"]) * u.deg,
        solar_elongation=float(data["sun"]["solarElongation"]) * u.deg,
        year=int(data["sun"]["year"]),
    )
    telescope = Telescope(
        effective_mirror_area=float(data["earth"]["mirrorArea"]) * u.cm**2,
        grating_angle=None,
        grating_groove_frequency=None,
    )
    seeing = float(data["earth"]["seeing"]) * u.arcsec
    source = Source(
        extension=source_extension,
        spectrum=spectrum_parts,
        zenith_distance=float(data["earth"]["targetZenithDistance"]) * u.deg,
    )
    return Configuration(
        moon=moon, seeing=seeing, source=source, sun=sun, telescope=telescope
    )
