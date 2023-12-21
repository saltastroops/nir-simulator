import json
from typing import cast

import numpy as np
from astropy import units as u
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from synphot import units

from constants import get_minimum_wavelength, get_maximum_wavelength
from nirwals.configuration import configuration, Exposure
from nirwals.physics.bandpass import throughput
from nirwals.physics.exposure import source_electrons, snr, exposure_time
from nirwals.physics.spectrum import source_spectrum, sky_spectrum
from nirwals.utils import prepare_spectrum_plot_values


@csrf_exempt
def throughput_view(request: HttpRequest) -> JsonResponse:
    parameters = json.loads(request.POST.get("data", None))
    config = configuration(parameters)
    throughput_spectrum = throughput(config)
    wavelengths = throughput_spectrum.waveset
    throughputs = throughput_spectrum(wavelengths)
    plot_wavelengths, plot_throughputs = prepare_spectrum_plot_values(
        wavelengths, throughputs, u.dimensionless_unscaled
    )
    data = {
        "wavelengths": plot_wavelengths,
        "throughputs": plot_throughputs,
    }
    return JsonResponse(data)


@csrf_exempt
def spectrum_view(request: HttpRequest) -> JsonResponse:
    parameters = json.loads(request.POST.get("data", None))
    config = configuration(parameters)
    source = source_spectrum(config)
    source_wavelengths = source.waveset
    if source_wavelengths is None:
        min_wavelength = get_minimum_wavelength().to(u.AA).value
        max_wavelength = get_maximum_wavelength().to(u.AA).value
        source_wavelengths = np.array([min_wavelength, max_wavelength]) * u.AA
    source_fluxes = source(source_wavelengths)
    plot_source_wavelengths, plot_source_fluxes = prepare_spectrum_plot_values(
        source_wavelengths, source_fluxes, units.PHOTLAM
    )
    sky = sky_spectrum()
    sky_wavelengths = sky.waveset
    sky_fluxes = sky(sky_wavelengths)
    plot_sky_wavelengths, plot_sky_fluxes = prepare_spectrum_plot_values(
        sky_wavelengths, sky_fluxes, units.PHOTLAM
    )
    data = {
        "source": {
            "x": plot_source_wavelengths,
            "y": plot_source_fluxes,
        },
        "sky": {
            "x": plot_sky_wavelengths,
            "y": plot_sky_fluxes,
        },
    }
    return JsonResponse(data)


@csrf_exempt
def exposure_view(request: HttpRequest) -> JsonResponse:
    # Get plot data based on configuration options
    parameters = json.loads(request.POST.get("data", None))
    config = configuration(parameters)

    # Is the SNR or the exposure time requested?
    exposure = cast(Exposure, config.exposure)
    is_snr_requested = exposure.snr is None

    # Get the SNR values or exposure times, whichever is requested. If exposure times
    # are requested, we also set the exposure time in the configuration to the one
    # needed for the requested SNR, as we need to have an exposure time defined for
    # getting the target electron counts.
    data = {}
    if is_snr_requested:
        snr_wavelengths, snr_values = snr(config)
        plot_snr_wavelengths, plot_snr_values = prepare_spectrum_plot_values(
            snr_wavelengths, snr_values, u.dimensionless_unscaled
        )
        data["snr"] = {
            "wavelengths": plot_snr_wavelengths,
            "snr_values": plot_snr_values,
        }
    else:
        snr_values, exposure_times = exposure_time(config)
        data["exposure_time"] = {
            "snr_values": snr_values.to(u.dimensionless_unscaled).value.tolist(),
            "exposure_times": exposure_times.to(u.s).value.tolist(),
        }
        exposure.exposure_time = exposure_times[50]

    # Get the target electron counts.
    electron_wavelengths, electron_counts = source_electrons(config)
    plot_electron_wavelengths, plot_electron_counts = prepare_spectrum_plot_values(
        electron_wavelengths, electron_counts, u.photon
    )
    data["target_electrons"] = {
        "wavelengths": plot_electron_wavelengths,
        "counts": plot_electron_counts,
    }

    return JsonResponse(data)
