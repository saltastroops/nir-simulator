from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..modules.data.throughput import get_plot_data


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
    }

    if request.method == "POST":
        # If it's a POST request, update configuration options with POST data
        post_data = request.POST
        for key in default_options:
            default_options[key] = post_data.get(key, default_options[key])

    # Get plot data based on configuration options
    x, y = get_plot_data(default_options)

    # Prepare data for response
    data = {
        'x': list(x),
        'y': list(y)
    }

    return JsonResponse(data)
