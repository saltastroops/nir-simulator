import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from nirwals.configure.data.throughput import get_plot_data


@csrf_exempt
def throughput(request):
    # Default configuration options
    default_options = {
        "configuration_options": "imaging-mode",
        "filter": "clear-filter",
        "slit_type": "longslit",
        "slit_width": "1.5",
        "grating": "950",
        "grating_angle": "40",
        "target_zd": "31",
    }
    form_data = default_options

    # If it's a POST request, update configuration options with POST data
    post_data = request.POST
    for key in default_options:
        form_data[key] = post_data[key]

    # Get plot data based on configuration options
    x, y = get_plot_data(form_data)

    # Prepare data for response
    data = {"x": list(x), "y": list(y)}

    return JsonResponse(data)


@csrf_exempt
def spectra(request):
    parameters = json.loads(request.POST.get("data"))
    seeing = float(parameters["earth"]["seeing"])
    data = {
        "source": {"x": [9000, 17000], "y": [1, 3 * seeing]},
        "background": {"x": [9000, 17000], "y": [1.5 * seeing, 3]},
    }
    return JsonResponse(data)
