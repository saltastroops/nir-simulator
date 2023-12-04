import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from nirwals.configure.data.throughput import get_configured_throughput_spectrum
from nirwals.configure.data.spectrum import get_sources_spectrum, get_sky_spectrum


@csrf_exempt
def throughput(request):
    configuration = json.loads(request.POST.get("data"))
    # Get plot data based on configuration options
    wavelengths, throughputs = get_configured_throughput_spectrum(configuration)
    # Prepare data for response
    data = {
        "wavelengths": wavelengths.tolist(),
        "throughputs": throughputs.tolist(),
    }
    return JsonResponse(data)


@csrf_exempt
def spectra(request):
    parameters = json.loads(request.POST.get("data"))
    wavelength, sources_flux_values = get_sources_spectrum(parameters)
    _, sky_flux_values = get_sky_spectrum(parameters)
    data = {
        "source": {"x": wavelength.tolist(), "y": sources_flux_values.tolist()},
        "sky": {"x": wavelength.tolist(), "y": sky_flux_values.tolist()},
    }
    return JsonResponse(data)
