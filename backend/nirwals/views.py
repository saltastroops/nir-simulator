import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from nirwals.configure.data.throughput import get_throughput_plot_data
from nirwals.configure.data.spectrum import get_sources_spectrum, get_sky_spectrum

from nirwals.configure.data.exposure import snr_plot_data


@csrf_exempt
def throughput(request):
    configuration = json.loads(request.POST.get("data"))
    # Get plot data based on configuration options
    wavelengths, throughputs = get_throughput_plot_data(configuration)
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


@csrf_exempt
def solve_for_snr(request):
    # Get plot data based on configuration options
    parameters = json.loads(request.POST.get("data"))

    # Prepare data for response
    wavelength, snr = snr_plot_data(parameters)
    additional_plot = {
        "x": {
            "label": "X-label",
            "values": [1, 2, 3, 4, 5]
        },
        "y": {
            "label": "Y-label",
            "values": [2, 3, 5, 0, 4]
        }
    }

    data = {
        "target_electrons_plot": {"wavelength": list(wavelength), "counts": list(snr)},
        "additional_plot": additional_plot
    }

    return JsonResponse(data)
