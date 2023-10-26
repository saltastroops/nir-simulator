from django.http import JsonResponse
from ..exposure.data.data import calculate_snr


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
