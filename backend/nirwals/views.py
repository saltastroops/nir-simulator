import json

from astropy import units as u
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from synphot import units

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
def solve_for_snr(request: HttpRequest) -> JsonResponse:
    # Get plot data based on configuration options
    configuration(request.POST.get("data", None))
    json.loads(request.POST.get("data", None))

    # Prepare data for response
    wavelength, snr = [2, 3], [2, 3]
    additional_plot = {
        "x": {"label": "X-label", "values": [1, 2, 3, 4, 5]},
        "y": {"label": "Y-label", "values": [2, 3, 5, 0, 4]},
    }

    data = {
        "target_electrons_plot": {"wavelength": list(wavelength), "counts": list(snr)},
        "additional_plot": additional_plot,
    }

    return JsonResponse(data)
