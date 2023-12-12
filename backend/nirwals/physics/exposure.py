import math
from typing import cast

import numpy as np
from astropy import units as u
from astropy.units import Quantity
from synphot import Observation, units

from constants import (
    FIBRE_RADIUS,
    TELESCOPE_FOCAL_LENGTH,
    COLLIMATOR_FOCAL_LENGTH,
    CCD_PIXEL_SIZE,
    CAMERA_FOCAL_LENGTH,
    get_minimum_wavelength,
    get_maximum_wavelength,
)
from nirwals.configuration import (
    Configuration,
    Filter,
    Source,
    Grating,
    SamplingType,
    Exposure,
    Detector,
)
from nirwals.physics.bandpass import (
    atmospheric_transmission,
    telescope_throughput,
    fibre_throughput,
    filter_transmission,
    grating_efficiency,
    detector_quantum_efficiency,
)
from nirwals.physics.spectrum import sky_spectrum, source_spectrum
from nirwals.physics.utils import shift


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
    grating_angle: u.deg, grating_constant: u.micron
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


def detection_rates(
    area: Quantity,
    grating_angle: u.deg,
    grating_constant: Quantity,
    observation: Observation,
) -> tuple[Quantity, Quantity]:
    """
    Return the count rates of an observation, binned for the wavelength resolution.

    The function bins the observation's wavelength bins together, so that the new bins
    cover the wavelength resolution element as tightly as possible. For example, if each
    observation wavelength bin covers 5 A and the wavelength resolution element is
    23 A, then the new bins will consist of 5 of the original bins each. The first five
    original bins become the first new bin, the sixth to tenth original bin become the
    second new bin, and so on.

    The wavelengths corresponding to the new bins are taken to be the midpoints of the
    new bins.

    The flux in each new bin is integrated and multiplied by the given area. These rates
    are returned together with the new wavelengths.

    This function assumes that the bin set of the observation is equidistant, and that
    each wavelength bin corresponds to the wavelength range covered by a pixel.

    The rates of the first and last bin should be considered to have arbitrary values,
    as they are affected by boundary effects.

    Parameters
    ----------
    area: Quantity
        Effective mirror area.
    grating_angle: Angle
        Grating angle.
    grating_constant: u.micron
        The grating constant, i.e. the spacing between grooves.
    observation: Observation
        Observation.

    Returns
    -------
    tuple
        A tuple of wavelengths and corresponding rates.
    """

    wavelengths = observation.binset
    wavelength_values = wavelengths.to(u.AA).value
    flux_values = observation(wavelengths).to(units.PHOTLAM).value
    delta_lambda = wavelengths[1] - wavelengths[0]
    delta_lambda_value = delta_lambda.to(u.AA).value
    pixel_flux_values = _bin_integrals(wavelength_values, flux_values)

    # Find the binning so that each bin covers the wavelength resolution element as
    # tightly as possible.
    binning = 1
    wre = wavelength_resolution_element(
        grating_angle=grating_angle, grating_constant=grating_constant
    )
    while binning * delta_lambda < wre:
        binning += 1

    # Get the wavelengths for the bin wavelengths and the fluxes in the bins.
    bin_wavelength_values: list[float] = []
    bin_flux_values: list[float] = []
    pixel = 0
    while pixel < len(wavelengths):
        # Get the wavelength in the middle of the bin. The current pixel is the first in
        # the bin and the distance between the midpoints of the bin's outer pixels is
        # the binsize less one pixel.
        bin_wavelength_value = (
            wavelength_values[0] + (pixel + 0.5 * (binning - 1)) * delta_lambda_value
        )
        bin_wavelength_values.append(bin_wavelength_value)

        # Add up the fluxes of the pixels in the bin. If we are running out of pixels
        # for the last bin, we assume a flux of 0 for the "missing" pixels.
        bin_flux_value = 0
        for _ in range(binning):
            pixel_flux = (
                pixel_flux_values[pixel] if pixel < len(pixel_flux_values) else 0
            )
            bin_flux_value += pixel_flux
            pixel += 1
        bin_flux_values.append(bin_flux_value)

    # Add the units, and convert fluxes to rates.
    bin_wavelengths = np.array(bin_wavelength_values) * u.AA
    rates = np.array(bin_flux_values) * area * u.AA * units.PHOTLAM

    # Returns wavelengths and rates.
    return bin_wavelengths, rates


def readout_noise(
    read_noise: float, samplings: int, sampling_type: SamplingType
) -> float:
    """
    Return the readout noise for a single exposure.

    Parameters
    ----------
    read noise: float
        Read noise.
    samplings: int
        Number of samplings (per exposure).
    sampling_type: SamplingType
        Sampling type, such as "Fowler".

    Returns
    -------
    float
        The readout noise.
    """
    match sampling_type:
        case "Fowler":
            return read_noise**2 / (samplings / 2)
        case "Up-the-Ramp":
            return read_noise**2 / (samplings / 12)


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


def _bin_integrals(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """
    Calculate the integral per bin for given x and y values.

    The given x values must be equidistant, i.e. x[k] - x[k - 1] must be the same for
    all 1 < k < len(k). This is not checked, though. x[k] is the midpoint of the bin
    [x[k] - dx/2, x[k] + dx/2], where dx is the distance between adjacent x values.

    The given y values are assumed to be function values at the corresponding x value,
    y[k] = f(x[k]).

    The function calculates the integral over f for each bin using trapezoidal
    integration and returns the result. For the first and last bin the assumption is
    made that f(x[0] - dx/2) = f(x[-1] + dx/2) = 0.

    Parameters
    ----------
    x: np.ndarray
        Array of bin midpoints.
    y: np.ndarray
        Array of y values corresponding to the bin midpoints.

    Returns
    -------
    np.ndarray
        The integral value for each bin.
    """

    # Sanity checks
    if len(x) < 2:
        raise ValueError("There must be at least two x values.")
    if x.shape != y.shape:
        raise ValueError("The shapes of x and y must be the same.")

    dx = x[1] - x[0]
    n = np.concatenate((np.array([0]), y, np.array([0])))
    n_shifted_left = shift(n, -1)
    n_shifted_right = shift(n, +1)
    integrals = 0.25 * dx * (n_shifted_left + 2 * n + n_shifted_right)

    return cast(np.ndarray, integrals[1:-1])


def snr(configuration: Configuration) -> tuple[Quantity, Quantity]:
    # Get the source and sky observation.
    source = source_observation(configuration)
    sky = sky_observation(configuration)

    # Get the source and sky detection rates,
    grating = cast(Grating, configuration.telescope.grating)
    wavelengths_source, rates_source = detection_rates(
        area=configuration.telescope.effective_mirror_area,
        grating_angle=grating.grating_angle,
        grating_constant=grating.grating_constant,
        observation=source,
    )
    wavelengths_sky, rates_sky = detection_rates(
        area=configuration.telescope.effective_mirror_area,
        grating_angle=grating.grating_angle,
        grating_constant=grating.grating_constant,
        observation=sky,
    )

    # Collect the remaining relevant configuration parameters.
    exposure = cast(Exposure, configuration.exposure)
    e = exposure.exposures
    t = exposure.exposure_time
    detector = cast(Detector, configuration.detector)
    read_noise = detector.read_noise
    samplings = detector.samplings
    sampling_type = detector.sampling_type
    r = readout_noise(
        read_noise=read_noise, samplings=samplings, sampling_type=sampling_type
    )

    # Calculate the SNR.
    source_counts = (
        (rates_source * e * t).to(units.PHOTLAM * u.AA * u.cm**2 * u.s).value
    )
    sky_counts = (rates_sky * e * t).to(units.PHOTLAM * u.AA * u.cm**2 * u.s).value
    snr_values = source_counts / np.sqrt(source_counts + sky_counts + r * e)

    # Return the wavelengths and SNR values.
    return wavelengths_source, snr_values
