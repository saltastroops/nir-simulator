import json

import numpy as np
from astropy import units as u
from bokeh.plotting._plot import _get_num_minor_ticks
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from synphot import units

from constants import get_minimum_wavelength, get_maximum_wavelength
from nirwals.configuration import configuration
from nirwals.physics.bandpass import throughput
from nirwals.physics.spectrum import source_spectrum, sky_spectrum


@csrf_exempt
def throughput_view(request: HttpRequest) -> JsonResponse:
    parameters = json.loads(request.POST.get("data", None))
    config = configuration(parameters)
    throughput_spectrum = throughput(config)
    wavelengths = throughput_spectrum.waveset
    throughputs = throughput_spectrum(wavelengths)
    data = {
        "wavelengths": wavelengths.to(u.AA).value.tolist(),
        "throughputs": throughputs.to(u.dimensionless_unscaled).value.tolist(),
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
    sky = sky_spectrum()
    sky_wavelengths = sky.waveset
    sky_fluxes = sky(sky_wavelengths)
    data = {
        "source": {
            "x": source_wavelengths.to(u.AA).value.tolist(),
            "y": source_fluxes.to(units.PHOTLAM).value.tolist(),
        },
        "sky": {
            "x": sky_wavelengths.to(u.AA).value.tolist(),
            "y": sky_fluxes.to(units.PHOTLAM).value.tolist(),
        },
    }
    return JsonResponse(data)


@csrf_exempt
def exposure_view(request: HttpRequest) -> JsonResponse:
    # Get plot data based on configuration options
    parameters = json.loads(request.POST.get("data", None))
    config = configuration(parameters)

    # Is the SNR or the exposure time requested?
    is_snr_requested = config.exposure.snr is None

    # Prepare data for response
    wavelengths, snr = [9000, 17000], [2, 3]
    data = {"target_counts": {"wavelengths": wavelengths, "counts": [2, 3]}}
    if is_snr_requested:
        data["snr"] = {"wavelengths": wavelengths, "snr_values": [42, 84]}
    else:
        data["exposure_time"] = {"exposure_times": [0, 100], "snr_values": [0, 20]}

    return JsonResponse(data)
