import math
import pathlib
from typing import get_args, cast

import numpy as np
from astropy import units as u
from synphot import SpectralElement, Empirical1D, ConstFlux1D

from constants import get_file_base_dir, TELESCOPE_SEEING, FIBRE_RADIUS
from nirwals.configuration import (
    GratingName,
    Filter,
    SourceExtension,
    Configuration,
    Grating,
    Source,
)
from nirwals.physics.utils import read_from_file


@u.quantity_input
def atmospheric_transmission(zenith_distance: u.deg) -> SpectralElement:
    """
    Return the atmospheric transmission curve for a given zenith distance.
    Parameters
    ----------
    zenith_distance: Angle
        Zenith distance.

    Returns
    -------
    SpectralElement
        The transmission curve.
    """
    # Get the extinction coefficients.
    path = pathlib.Path(get_file_base_dir() / "atmospheric_extinction_coefficients.npz")
    with open(path, "rb") as f:
        wavelengths, kappa_values = read_from_file(f)

    # Calculate the transmission values.
    sec_z = 1 / math.cos(zenith_distance.to(u.rad).value)
    transmissions = np.power(10, -0.4 * kappa_values * sec_z)

    # Return the extinction.
    return SpectralElement(Empirical1D, points=wavelengths, lookup_table=transmissions)


def detector_quantum_efficiency() -> SpectralElement:
    """
    Return the quantum efficiency of the detector.

    Returns
    -------
    SpectralElement
        The quantum efficiency.
    """
    path = pathlib.Path(get_file_base_dir() / "detector_quantum_efficiency.npz")
    with open(path, "rb") as f:
        wavelengths, efficiencies = read_from_file(f)
    return SpectralElement(Empirical1D, points=wavelengths, lookup_table=efficiencies)


def filter_transmission(filter_name: Filter) -> SpectralElement:
    """
    Return the transmission curve for a given filter.
    Parameters
    ----------
    filter_name: Filter
        Filter name.

    Returns
    -------
    SpectralElement
        The filter transmission curve.
    """
    # Sanity check
    match filter_name:
        case "Clear Filter":
            filename = "clear_filter_transmission.npz"
        case "LWBF":
            filename = "lwbf_transmission.npz"
        case _:
            raise ValueError(f"Unsupported filter: {filter_name}")

    # Get the filter transmission.
    path = pathlib.Path(get_file_base_dir() / "filters" / filename)
    with open(path, "rb") as f:
        wavelengths, transmissions = read_from_file(f)
    return SpectralElement(Empirical1D, points=wavelengths, lookup_table=transmissions)


@u.quantity_input
def fibre_throughput(
    seeing: u.arcsec, source_extension: SourceExtension, zenith_distance: u.deg
) -> SpectralElement:
    """
    Return the fibre throughput.

    For a point source the throughput is the fraction of the flux in the seeing disk
    which is covered by the fibre, assuming the source is located at the centre of the
    fibre. The seeing disk includes atmospheric and telescope seeing.

    For a diffuse source the throughput is 1, as losses and gains due to seeing cancel.

    Parameters
    ----------
    seeing: Angle
        The full width half maximum of the seeing disk for a zenith distance of 0.
    source_extension: SourceExtension
        The source extension ("Point" or "Diffuse"O).
    zenith_distance: Angle
        The zenith distance of the source.

    Returns
    -------
    SpectralElement
        The fibre throughput.
    """
    # Sanity check
    if source_extension not in get_args(SourceExtension):
        raise ValueError(f"Unsupported source extension {source_extension}")

    # There is no throughput loss for diffuse sources.
    if source_extension == "Diffuse":
        return SpectralElement(ConstFlux1D, amplitude=1)

    # Get the standard deviation for atmospheric seeing.
    sec_z = 1 / math.cos(zenith_distance.to(u.rad).value)
    sigma_atm = seeing * sec_z ** (3 / 5) / (2 * math.sqrt(2 * math.log(2)))

    # Get the standard deviation for the telescope seeing.
    sigma_tel = TELESCOPE_SEEING / (2 * math.sqrt(2 * math.log(2)))

    # Get the square of the total standard deviation for the seeing disk
    sigma_squared = sigma_atm**2 + sigma_tel**2

    # Calculate the fraction of the seeing disk flux covered by the fibre.
    covered_fraction = 1 - math.exp(-(FIBRE_RADIUS**2) / (2 * sigma_squared))

    # Return the throughput.
    return SpectralElement(ConstFlux1D, amplitude=covered_fraction)


@u.quantity_input
def grating_efficiency(
    grating_angle: u.deg, grating_name: GratingName
) -> SpectralElement:
    """
    Returns the grating efficiency for a given grating angle.

    The grating angle is the angle between the incoming light rays and the grating
    normal.

    Parameters
    ----------
    grating_angle: Angle
        Grating angle.
    grating_name: GratingName
        Grating name. This is equal to the grating frequency, i.e. grooves per mm.

    Returns
    -------
    SpectralElement
        The grating efficiency.

    """

    import numpy as np

    # Grating angles for which a grating efficiency file exists and the wavelengths for
    # the maxima of the corresponding grating efficiency curves.
    grating_parameters = [
        (30 * u.deg, 10795.6 * u.AA),
        (35 * u.deg, 12081.6 * u.AA),
        (40 * u.deg, 13400.4 * u.AA),
        (45 * u.deg, 14700.0 * u.AA),
        (50 * u.deg, 15907.2 * u.AA),
    ]
    angles = [gp[0] for gp in grating_parameters]
    maxima = {gp[0]: gp[1] for gp in grating_parameters}

    # Avoid rounding issues.
    eps = 0.000001
    if angles[0] - eps * u.deg < grating_angle < angles[0] + eps * u.deg:
        grating_angle = angles[0] + eps * u.deg
    if angles[-1] - eps * u.deg < grating_angle < angles[-1] + eps * u.deg:
        grating_angle = angles[-1] - eps * u.deg

    # Find the smallest interval [alpha1, alpha2] in angles with
    # alpha1 <= alpha <= alpha2.
    if angles[0] > grating_angle or grating_angle > angles[-1]:
        raise ValueError(
            f"Only grating angles between {angles[0]} and {angles[1]} are "
            f"supported."
        )
    alpha1 = max([a for a in angles if a <= grating_angle])
    alpha2 = min([a for a in angles if grating_angle < a])

    # Figure out whether to shift the efficiency curve for alpha1 to the right or the
    # curve for alpha2 to the left.
    if grating_angle <= (alpha1 + alpha2) / 2:
        angle = alpha1
        shift_to_right = True
    else:
        angle = alpha2
        shift_to_right = False

    # Get the efficiency curve to shift.
    angle_value = round(angle.to(u.deg).value)
    path = pathlib.Path(
        get_file_base_dir()
        / "gratings"
        / grating_name
        / f"grating_{grating_name}_{angle_value}deg.npz"
    )
    with open(path, "rb") as f:
        wavelengths_, efficiencies_ = read_from_file(f)
    efficiency = SpectralElement(
        Empirical1D, points=wavelengths_, lookup_table=efficiencies_
    )

    # Perform the shift
    lmax1 = maxima[alpha1]
    lmax2 = maxima[alpha2]
    if shift_to_right:
        shift = -((grating_angle - alpha1) / (alpha2 - alpha1)) * (lmax2 - lmax1)
    else:
        shift = ((alpha2 - grating_angle) / (alpha2 - alpha1)) * (lmax2 - lmax1)
    wavelengths = np.arange(4000, 22000, 0.2) * u.AA
    shifted_wavelengths = wavelengths + shift
    shifted_efficiencies = efficiency(shifted_wavelengths)

    # Return the grating efficiency.
    return SpectralElement(
        Empirical1D, points=wavelengths, lookup_table=shifted_efficiencies
    )


def telescope_throughput() -> SpectralElement:
    """
    Return the telescope throughput.

    The telescope throughput includes the mirror efficiency and the throughput of the
    telescope optics, but excludes the filter transmission, grating efficiency and
    detector efficiency.

    Returns
    -------
    SpectralElement
        The telescope throughput.
    """
    path = pathlib.Path(get_file_base_dir() / "telescope_throughput.npz")
    with open(path, "rb") as f:
        wavelengths, throughputs = read_from_file(f)
    return SpectralElement(Empirical1D, points=wavelengths, lookup_table=throughputs)


def throughput(configuration: Configuration) -> SpectralElement:
    """
    Calculate the throughput for a given configuration.

    The throughput includes the following:

    - The atmospheric transmission
    - The mirror efficiency
    - The fibre throughput
    - The filter transmission
    - The grating efficiency
    - The detector quantum efficiency

    Parameters
    ----------
    configuration: Configuration
        The configuration.

    Returns
    -------
    SpectralElement
        The throughput.
    """
    grating = cast(Grating, configuration.telescope.grating)
    configuration_source = cast(Source, configuration.source)
    bandpass = (
        atmospheric_transmission(zenith_distance=configuration.zenith_distance)
        * telescope_throughput()
        * fibre_throughput(
            seeing=configuration.seeing,
            source_extension=configuration_source.extension,
            zenith_distance=configuration.zenith_distance,
        )
        * filter_transmission(filter_name=cast(Filter, configuration.telescope.filter))
        * grating_efficiency(
            grating_angle=grating.grating_angle,
            grating_name=grating.name,
        )
        * detector_quantum_efficiency()
    )

    return bandpass
