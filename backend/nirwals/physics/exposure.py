import math
from typing import cast

import numpy as np
from astropy import units as u
from astropy.units import Quantity
from synphot import Observation

from constants import (
    FIBRE_RADIUS,
    TELESCOPE_FOCAL_LENGTH,
    COLLIMATOR_FOCAL_LENGTH,
    CCD_PIXEL_SIZE,
    CAMERA_FOCAL_LENGTH,
    get_minimum_wavelength,
    get_maximum_wavelength,
)
from nirwals.configuration import Configuration, Filter, Source, Grating
from nirwals.physics.bandpass import (
    atmospheric_transmission,
    telescope_throughput,
    fibre_throughput,
    filter_transmission,
    grating_efficiency,
    detector_quantum_efficiency,
)
from nirwals.physics.spectrum import sky_spectrum, source_spectrum


def source_observation(configuration: Configuration) -> Observation:
    """
    Returns the source observation for a given configuration.

    The observation, represented by a synphot Observation object, is the photon flux
    detected, which means it is the source spectrum with the following losses applied:

    - Atmospheric extinction
    - Telescope throughput
    - Fibre throughput
    - Filter transmission
    - Grating efficiency
    - Detector quantum efficiency

    The bin set of the Observation object is chosen so that the bin just size is equal
    to the wavelength range covered by a single pixel.

    The bin set covers the wavelength range from lambda_min - 100 A to at least
    lambda_max + 100 A, where lambda_min and lambda_max are the minimum and maximum
    requested wavelengths. The extra 100 A are added to avoid artifacts at the
    boundaries of the requested wavelength range.

    Parameters
    ----------
    configuration: Configuration
        Simulator configuration.

    Returns
    -------
    Observation
        The observation for the source spectrum.
    """
    source = source_spectrum(configuration=configuration)
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
    return Observation(
        source,
        bandpass,
        binset=_binset(
            grating_angle=grating.grating_angle,
            grating_constant=grating.grating_constant,
        ),
    )


def sky_observation(configuration: Configuration) -> Observation:
    """
    Returns the sky background observation for a given configuration.

    The observation, represented by a synphot Observation object, is the photon rate
    detected, which means it is the sky background flux with the following losses
    applied:

    - Telescope throughput
    - Fibre throughput
    - Filter transmission
    - Grating efficiency
    - Detector quantum efficiency

    No atmospheric extinction is applied, as it is assumed that it is included in the
    background spectrum already.

    The bin set of the Observation object is chosen so that the bin just size is equal
    to the wavelength range covered by a single pixel.

    The bin set covers the wavelength range from lambda_min - 100 A to at least
    lambda_max + 100 A, where lambda_min and lambda_max are the minimum and maximum
    requested wavelengths. The extra 100 A are added to avoid artifacts at the
    boundaries of the requested wavelength range.

    Parameters
    ----------
    configuration: Configuration
        Simulator configuration.

    Returns
    -------
    Observation
        The observation for the sky background.
    """
    sky = sky_spectrum()
    grating = cast(Grating, configuration.telescope.grating)
    bandpass = (
        telescope_throughput()
        * fibre_throughput(
            seeing=configuration.seeing,
            source_extension="Diffuse",
            zenith_distance=configuration.zenith_distance,
        )
        * filter_transmission(filter_name=cast(Filter, configuration.telescope.filter))
        * grating_efficiency(
            grating_angle=grating.grating_angle,
            grating_name=grating.name,
        )
        * detector_quantum_efficiency()
    )
    return Observation(
        sky,
        bandpass,
        binset=_binset(grating.grating_angle, grating.grating_constant),
    )


def wavelength_resolution_element(
    grating_constant: u.micron, grating_angle: u.deg
) -> u.AA:
    """
    Return the wavelength resolution element for a grating setup.

    Parameters
    ----------
    grating_constant: Quantity
        The grating constant, i.e. the groove spacing.
    grating_angle: Angle
        The grating angle, i.e. the angle of the incoming rays to the grating normal.

    Returns
    -------
    Quantity
        The wavelength resolution element.
    """
    # Angle of a fibre on the sky, in radians
    phi_fibre = 2 * FIBRE_RADIUS.to(u.rad).value

    return (
        phi_fibre
        * (TELESCOPE_FOCAL_LENGTH / COLLIMATOR_FOCAL_LENGTH)
        * grating_constant
        * math.cos(grating_angle.to(u.rad).value)
    )


def pixel_wavelength_range(grating_angle: u.deg, grating_constant: u.micron) -> u.AA:
    """
    Return the wavelength range covered by a single CCD pixel.

    Parameters
    ----------
    grating_angle: Angle
        The grating angle, i.e. the angle of the incoming rays to the grating normal.
    grating_constant: Quantity
        The grating constant, i.e. the groove spacing.

    Returns
    -------
    Quantity
        The wavelength range covered by a single pixel.
    """
    return (
        grating_constant
        * CCD_PIXEL_SIZE
        * math.cos(grating_angle.to(u.rad).value)
        / CAMERA_FOCAL_LENGTH
    )


def _binset(grating_angle: u.deg, grating_constant: Quantity) -> Quantity:
    # Get the step size for the bin set.
    delta_lambda = pixel_wavelength_range(grating_angle, grating_constant)

    # Calculate the bin set values in Angstrom
    binset_start_value = get_minimum_wavelength().to(u.AA).value - 100
    binset_end_value = get_maximum_wavelength().to(u.AA).value + 100.1
    delta_lambda_value = delta_lambda.to(u.AA).value
    binset_values = np.arange(binset_start_value, binset_end_value, delta_lambda_value)

    # Return the bin set.
    return binset_values * u.AA
