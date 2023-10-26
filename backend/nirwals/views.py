import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from nirwals.configure.data.throughput import get_plot_data
from nirwals.configure.data.spectrum import get_spectrum_data
from nirwals.configure.data.exposure import calculate_snr


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
    wav, flux = get_spectrum_data(parameters)
    data = {
        "source": {"x": wav.tolist(), "y": flux.tolist()},
        "background": {"x": [9000, 17000], "y": [1.5 * seeing, 3]},
    }
    return JsonResponse(data)


def solve_for_snr(request):
    form_data = {
        "gain": 2.04,
        "full_well": 60000,
        "read_noice": 17,
        "sampling": "Up The Ramp",
        "number_of_samples": 10,
        "instrument_mode": "Imaging",
        "seeing": 1.0,
        "target_zd": 37,
        "detector_iterations": 1,
        "exposure_time": 3600,
        "effective_telescope_area": 460000,
        "atm_extinction": False,
        "source": "Diffused",
        "filter": "Clear Filter",
        "grating": 950,
        "grating_angle": 40,
        "sources": [
            {
                "name": "Black Body",
                "apparent_magnitude": 18,
                "temperature": 3000
            },
            {
                "name": "Black Body",
                "apparent_magnitude": 18,
                "temperature": 3000
            },
            {
                "name": "Emission Line",
                "flux": 1e-16,
                "central_wavelength": 13000,
                "fwhm": 100,
                "redshift": 0.0,
            },
            {
                "name": "Galaxy",
                "type": "E",
                "age": "Young",
                "apparent_magnitude": 20,
                "redshift": 0.0,
                "generate_emission_lines": True
            }
        ]
    }
    # Get plot data based on configuration options
    caled = calculate_snr(form_data)

    # Prepare data for response
    data = {
        'x': list(caled["wavelength"]),
        'y': list(caled["spectrum"]),
        'signalToNoice': caled["signal_to_noise"]
    }

    return JsonResponse(data)
