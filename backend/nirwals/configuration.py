import dataclasses
from pathlib import Path

from astropy import units as u
from typing import Literal, Any

from astropy.coordinates import Angle
from astropy.units import Quantity


# LWBF: Long Wavelength Blocking Filter
Filter = Literal["Clear Filter", "LWBF"]

GalaxyAge = Literal["Old", "Young"]

GalaxyType = Literal["E", "S0", "Sa", "Sb", "Sc", "Sd"]

GratingName = Literal["950"]

SamplingType = Literal["Fowler", "Up-the-Ramp"]

SourceExtension = Literal["Diffuse", "Point"]


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

    age: GalaxyAge
    galaxy_type: GalaxyType
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
class Grating:
    """
    A grating configuration.

    Parameters
    ----------
    grating_angle: Quantity
        The grating angle, i.e. the angle of the incoming rays to the grating normal.
    name: str
        The grating name.
    """

    grating_angle: Quantity
    name: GratingName

    @property
    def grating_constant(self) -> u.micron:
        """Quantity: The grating constant, i.e. the spacing between grooves."""
        groove_frequency = float(self.name) * u.mm**-1
        return 1 / groove_frequency


@dataclasses.dataclass
class Detector:
    """
    Detector related parameters.

    Parameters
    ----------
    full_well: int
        CCD full well.
    gain: float
        Gain, i.e. electrons per ADU.
    read_noise: float
        Readout noise for a single read.
    """

    full_well: int
    gain: float
    read_noise: float
    samplings: int
    sampling_type: SamplingType


@dataclasses.dataclass
class SNR:
    """
    Signal-to-noise ratio at a wavelength.

    Parameters
    ----------
    snr: float
        Signal-to-noise ratio (SNR).
    wavelength: Quantity
        Wavelength for the which the SNR is given.
    """

    snr: float
    wavelength: Quantity


@dataclasses.dataclass
class Exposure:
    """
    Exposure related parameters.

    Either the exposure time or the signal-to-noise ratio must be specified, but not
    both.

    Parameters
    ----------
    exposures: int
        The number of exposures.
    exposure_time: Quantity, optional
        The requested exposure time for a single exposure.
    snr: SNR, optional
        The requested signal-to-noise ratio (SNR).
    """

    exposures: int
    exposure_time: Quantity | None
    snr: SNR | None

    def __init__(
        self, exposures: int, exposure_time: Quantity | None, snr: SNR | None
    ) -> None:
        if exposure_time is None and snr is None:
            raise ValueError("An exposure time or SNR must be given.")
        if exposure_time is not None and snr is not None:
            raise ValueError("The exposure time and SNR are mutually exclusive.")
        self.exposures = exposures
        self.exposure_time = exposure_time
        self.snr = snr


@dataclasses.dataclass
class Telescope:
    """
    Telescope properties.

    Parameters
    ----------
    effective_mirror_area: Quantity
        The effective telescope mirror area.
    filter: Filter, optional
        The filter.
    grating: Grating, optional
        The grating setup.
    """

    effective_mirror_area: Quantity | None
    filter: Filter | None
    grating: Grating | None


@dataclasses.dataclass
class Source:
    """
    A source configuration.

    extension: SourceExtension
        The source extension ("Diffuse" or "Point").
    spectrum: list of Spectrum
        The source spectrum, as a list of its constituent spectra.
    """

    extension: SourceExtension
    spectrum: list[Spectrum]


@dataclasses.dataclass
class Configuration:
    """
    A configuration.

    Parameters
    ----------
    detector: Detector | None
        The detector related properties.
    exposure: Exposure
        The exposure related properties.
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
    zenith_distance: Angle
        The zenith distance of the source.
    """

    detector: Detector | None
    exposure: Exposure | None
    moon: Moon | None
    seeing: Angle
    source: Source | None
    sun: Sun | None
    telescope: Telescope
    zenith_distance: Angle


def _parse_source(data: dict[str, Any]) -> Source | None:
    if "source" not in data:
        return None

    source_extension = data["source"]["type"]
    spectrum_parts: list[Spectrum] = []
    for s in data["source"]["spectrum"]:
        spectrum_type = s["spectrumType"]
        match spectrum_type:
            case "Blackbody":
                spectrum: Spectrum = Blackbody(
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
            case _:
                raise ValueError(f"Unsupported spectrum type: {spectrum_type}")

        spectrum_parts.append(spectrum)

    return Source(extension=source_extension, spectrum=spectrum_parts)


def configuration(data: dict[str, Any]) -> Configuration:
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
    source = _parse_source(data)

    if "moon" in data:
        moon: Moon | None = Moon(
            lunar_elongation=float(data["moon"]["lunarElongation"]) * u.deg,
            phase=float(data["moon"]["phase"]) * u.deg,
            zenith_distance=float(data["moon"]["zenithDistance"]) * u.deg,
        )
    else:
        moon = None

    if "sun" in data:
        sun: Sun | None = Sun(
            ecliptic_latitude=float(data["sun"]["eclipticLatitude"]) * u.deg,
            solar_elongation=float(data["sun"]["solarElongation"]) * u.deg,
            year=int(data["sun"]["year"]),
        )
    else:
        sun = None

    if "filter" in data:
        filter_name_data: str | None = data["filter"]
        if filter_name_data == "Clear Filter":
            filter_name: Filter | None = "Clear Filter"
        elif filter_name_data == "lwbf":
            filter_name = "LWBF"
        else:
            raise ValueError(f"Unsupported filter name: {filter_name_data}")
    else:
        filter_name = None

    if "grating" in data:
        grating: Grating | None = Grating(
            grating_angle=float(data["grating_angle"]) * u.deg,
            name=data["grating"],
        )
    else:
        grating = None

    if "exposure_configuration" in data:
        exposure_configuration = data["exposure_configuration"]

        sampling_type_data: str = exposure_configuration["sampling"]["sampling_type"]
        if sampling_type_data == "Fowler":
            sampling_type: SamplingType = "Fowler"
        elif sampling_type_data == "Up The Ramp":
            sampling_type = "Up-the-Ramp"
        else:
            raise ValueError(f"Unsupported sampling type: {sampling_type_data}")

        detector: Detector | None = Detector(
            full_well=int(exposure_configuration["gain"]["full_well"]),
            gain=float(exposure_configuration["gain"]["adu"]),
            read_noise=float(exposure_configuration["gain"]["read_noise"]),
            samplings=int(exposure_configuration["sampling"]["number_of_samples"]),
            sampling_type=sampling_type,
        )

        exposure_time = (
            float(exposure_configuration["exposure_time"]) * u.s
            if "exposure_time" in exposure_configuration
            else None
        )
        snr = (
            SNR(
                snr=float(exposure_configuration["snr"]),
                wavelength=float(exposure_configuration["wavelength"]) * u.AA,
            )
            if "snr" in exposure_configuration
            else None
        )
        if exposure_time is None and snr is None:
            raise ValueError("Either an exposure time or a SNR must be supplied.")
        if exposure_time is not None and snr is not None:
            raise ValueError("The exposure time and SNR are mutually exclusive.")

        exposure: Exposure | None = Exposure(
            exposures=int(exposure_configuration["detector_iterations"]),
            exposure_time=exposure_time,
            snr=snr,
        )
    else:
        detector = None
        exposure = None

    telescope = Telescope(
        effective_mirror_area=float(data["earth"]["mirrorArea"]) * u.cm**2,
        filter=filter_name,
        grating=grating,
    )

    if "earth" in data:
        seeing = float(data["earth"]["seeing"]) * u.arcsec
        zenith_distance = float(data["earth"]["targetZenithDistance"]) * u.deg
    else:
        seeing = None
        zenith_distance = None

    return Configuration(
        detector=detector,
        exposure=exposure,
        moon=moon,
        seeing=seeing,
        source=source,
        sun=sun,
        telescope=telescope,
        zenith_distance=zenith_distance,
    )
