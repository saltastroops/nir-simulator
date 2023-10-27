import pathlib
from functools import lru_cache

import numpy as np
from os import getenv
from scipy.constants import Planck, speed_of_light, Boltzmann

FILES_BASE_DIR = pathlib.Path(getenv("FILES_BASE_DIR"))


# Universal Constants
h = Planck * 10**7    # joules*seconds -> erg*seconds
c = speed_of_light * 10**10
kb = Boltzmann * 10**7  # joules/kelvin -> erg/kelvin

conv = {
    0: lambda x: float(x),  # conversion fn for column 0
    1: lambda x: float(x),  # conversion fn for column 1
}


def get_stellar_flux_values(wavelength: float, temperature: float, mag: float):
    flux = np.zeros(40001)
    star_black_body_radiation = ((2 * np.pi * h * c**2) / wavelength**5) * 1/(np.exp((h*c)/(wavelength*kb*temperature)) - 1)

    star_magnitude_flux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * mag)
    normalizer = (star_black_body_radiation[18000]) / star_magnitude_flux

    normalized_star_radiation = star_black_body_radiation/normalizer
    photon_count = (normalized_star_radiation / ((h * c) / wavelength))
    flux = flux + photon_count
    return flux


def get_galaxy_flux_values(wavelength: [], galaxy_type: str, age: str, has_emission_line: bool, magnitude: float, redshift: float):
    flux = np.zeros(40001)
    galaxy_types = ["E", "Sb", "Sa", "Sc", "Sd", "S0"]
    age_types = ["Young", "Old"]

    if galaxy_type in galaxy_types and age in age_types:
        filename = f"{age}_{galaxy_type}_type_{'emission' if has_emission_line else 'no_emission'}.csv"
        file_path = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / filename
        galaxy_wavelength, galaxy_flux = read_csv_file(file_path)

        galaxy_wavelength = galaxy_wavelength * (1 + redshift)
        galaxy_flux = galaxy_flux / (1 + redshift)

        starting_index = np.nonzero(np.isin(wavelength, galaxy_wavelength))[0][0]

        selected_galaxy_radiation = galaxy_flux[starting_index:starting_index+40001]
        galaxy_magnitude_flux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * magnitude)
        normalizer = selected_galaxy_radiation[18001] / galaxy_magnitude_flux

        normalized_star_radiation = selected_galaxy_radiation/normalizer
        photon_count = (normalized_star_radiation / ((h * c) / wavelength))
        flux = flux + photon_count
        return flux


def get_emission_line_values(wavelength: float, line_flux: float, lamda: float, line_fwhm: float, redshift: float):
    flux = np.zeros(40001)
    central_wavelength = lamda * (1 + redshift)
    line_signal = line_fwhm / 2.35

    line_profile = line_flux * 1 / (line_signal * np.sqrt(2 * np.pi)) * np.exp(-((wavelength - central_wavelength) ** 2 / (2 * line_signal**2)))

    flux = flux + line_profile / ((h * c) / wavelength)
    return flux


#  TODO Caching should be done Correctly
@lru_cache
def read_csv_file(filename):
    spectra_data = np.loadtxt(filename, delimiter=",",  quotechar="|",  converters=conv)
    wavelength = spectra_data[:, 0]
    flux = spectra_data[:, 1]
    return wavelength, flux


def get_sky_spectrum(form_data):
    parameters = form_data
    num_points = 40001
    data = np.empty(num_points, dtype=[
        ('wavelength', float),
        ('sky_flux', float)
    ])
    filename = "1-1-nirsky.csv"
    file_path = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / filename

    data['wavelength'], data['sky_flux'] = read_csv_file(file_path)

    if parameters["source"]["type"] == "Point":
        if not parameters["spectrumPlotOptions"]["calculateFluxInSeeingDisk"]:
            diffuse = (np.pi * float(parameters["earth"]["seeing"]) ** 2 / 4)
            data['sky_flux'] = data['sky_flux'] * diffuse

    if parameters["spectrumPlotOptions"]["multiplyWithMirrorAreaAndEfficiency"] == "true":
        filename = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "combinedtelescope.csv"
        wavelength, telescope_flux = read_csv_file(filename)

        data['sky_flux'] = data['sky_flux'] * telescope_flux
        data['sky_flux'] = data['sky_flux'] * int(parameters["mirror_area"])

    return data['wavelength'], data['sky_flux']


def get_sources_spectrum(form_data):
    parameters = form_data
    num_points = 40001
    data = np.empty(num_points, dtype=[
        ('wavelength', float),
        ('sources_flux', float),
    ])

    data['wavelength'] = np.array([9000 + i / 5 for i in range(num_points)])
    data['sources_flux'] = np.ones(num_points)

    sources = parameters["source"]["spectrum"]

    for source in sources:
        if source["spectrumType"] == "Blackbody":
            star_flux = get_stellar_flux_values(data['wavelength'], float(source["temperature"]), float(source["magnitude"]))
            data['sources_flux'] = data['sources_flux'] * star_flux
        if source["spectrumType"] == "Galaxy":
            has_emission_line = False
            galaxy_flux = get_galaxy_flux_values(data['wavelength'], source['type'], source["age"], has_emission_line, float(source["magnitude"]), float(source["redshift"]))
            data['sources_flux'] = data['sources_flux'] * galaxy_flux
        if source["spectrumType"] == "Emission Line":
            emission_line_flux = get_emission_line_values(data['wavelength'], float(source["flux"]), float(source["centralWavelength"]), float(source["fwhm"]), float(source["redshift"]))
            data['sources_flux'] = data['sources_flux'] * emission_line_flux

    if parameters["spectrumPlotOptions"]["includeAtmosphericExtinction"]:
        filename = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "nirskytransmission.csv"
        wavelength, flux = read_csv_file(filename)
        data['sources_flux'] = data['sources_flux'] * flux
    if parameters["source"]["type"] == "Point":
        if parameters["spectrumPlotOptions"]["calculateFluxInSeeingDisk"]:
            point_spread = 1 / (np.pi * float(parameters["earth"]["seeing"]) ** 2 / 4)
            data['sources_flux'] = data['sources_flux'] * point_spread
    if parameters["spectrumPlotOptions"]["multiplyWithMirrorAreaAndEfficiency"] == "true":
        filename = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "combinedtelescope.csv"
        wavelength, telescope_flux = read_csv_file(filename)

        data['sources_flux'] = data['sources_flux'] * telescope_flux
        data['sources_flux'] = data['sources_flux'] * int(parameters["mirror_area"])

    return data['wavelength'], data['sources_flux']
