import json

import numpy as np

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from synphot import units

from nirwals.configuration import configuration
from nirwals.configure.data.throughput import get_throughput_plot_data
from nirwals.configure.data.spectrum import get_sky_spectrum
from nirwals.physics.spectrum import source_spectrum


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
    data = json.loads(request.POST.get("data"))
    config = configuration(data)
    source = source_spectrum(config)
    source_wavelengths = np.linspace(9000, 16000, 4000)
    source_fluxes = source(source_wavelengths).to(units.PHOTLAM).value
    sky_wavelengths, sky_flux_values = get_sky_spectrum(data)
    data = {
        "source": {
            "x": source_wavelengths.tolist(),
            "y": source_fluxes.tolist(),
        },
        "sky": {"x": sky_wavelengths.tolist(), "y": sky_flux_values.tolist()},
    }
    return JsonResponse(data)
