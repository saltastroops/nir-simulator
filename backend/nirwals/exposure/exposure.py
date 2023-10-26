
from .data.data import calculate_snr


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
            "age": "young",
            "apparent_magnitude": 20,
            "redshift": 0.0,
            "generate_emission_lines": True
        }
    ]
}

calculate_snr(form_data)
