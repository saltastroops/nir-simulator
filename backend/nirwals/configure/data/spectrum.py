import pathlib
from functools import lru_cache

import numpy as np
from os import getenv

FILES_BASE_DIR = pathlib.Path(getenv("FILES_BASE_DIR"))


# Universal Constants
h = 6.62607 * 10 ** (-27)  # erg*seconds
c = 2.99792 * 10**18  # angstrom/second
kb = 1.38065 * 10 ** (-16)  # erg/kelvin

conv = {
    0: lambda x: float(x),  # conversion fn for column 0
    1: lambda x: float(x),  # conversion fn for column 1
}


def add_star_spectrum(wavelength, temperature: int, mag: int):
    spectra = np.zeros(40001)
    star_black_body_radiation = ((2 * np.pi * h * c**2) / wavelength**5) * 1/(np.exp((h*c)/(wavelength*kb*temperature)) - 1)

    star_magnitude_flux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * mag)
    normalizer = (star_black_body_radiation[18000]) / star_magnitude_flux

    normalized_star_radiation = star_black_body_radiation/normalizer
    photon_count = (normalized_star_radiation / ((h * c) / wavelength))
    spectra = spectra + photon_count
    return spectra


def add_galaxy_spectrum(wavelength, gal_type, age, has_emission_line, mag, redshift):
    spectra = np.zeros(40001)
    galaxy_types = ["E", "Sb", "Sa", "Sc", "Sd", "S0"]
    age_types = ["Young", "Old"]
    # emission_types = [True, False]

    if gal_type in galaxy_types and age in age_types:
        # galaxy_type = "young_" if age == "Young" else "old_"
        # galaxy_type += gal_type.lower() + ("_emis" if has_emission_line else "_no_emis")

        filename = f"{age}_{gal_type}_type_{'emission' if has_emission_line else 'no_emission'}.csv"
        file_path = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / filename
        _, spectrum = read_csv_file(file_path)

        starting_wavelength = 9000 / (1 + float(redshift))
        starting_wavelength = 2 * round(starting_wavelength / 2, 1)
        starting_index = np.where(wavelength == starting_wavelength)[0][0]
        selected_galaxy_radiation = spectrum[starting_index:starting_index+40001]
        galaxy_magnitude_flux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * mag)
        normalizer = selected_galaxy_radiation[18001] / galaxy_magnitude_flux

        normalized_star_radiation = selected_galaxy_radiation/normalizer
        photon_count = (normalized_star_radiation / ((h * c) / wavelength))
        spectra = spectra + photon_count
        return spectra


def add_emission_line(wavelength, line_flux: int | float, lamda: int, line_fwhm: int, redshift: float):
    spectra = np.zeros(40001)
    central_wavelength = lamda * (1 + redshift)
    line_signal = line_fwhm / 2.35

    line_profile = line_flux * 1 / (line_signal * np.sqrt(2 * np.pi)) * np.exp(-((wavelength - central_wavelength) ** 2 / (2 * line_signal**2)))

    spectra = spectra + line_profile / ((h * c) / wavelength)
    return spectra


#  TODO Caching should be done Correctly
@lru_cache
def read_csv_file(filename):
    spectra_data = np.loadtxt(filename, delimiter=",",  quotechar="|",  converters=conv)
    wavelength = spectra_data[:, 0]
    spectra = spectra_data[:, 1]
    return wavelength, spectra


def get_modifiers(parameters):
    num_points = 40001
    data = np.empty(num_points, dtype=[
        ('wavelength', float),
        ('flux', float),
    ])
    data['wavelength'] = np.array([9000 + i / 5 for i in range(num_points)])
    data['flux'] = np.ones(num_points)

    sources = parameters["source"]["spectrum"]

    for source in sources:
        if source["spectrumType"] == "Blackbody":
            star_flux = add_star_spectrum(data['wavelength'], int(source["temperature"]), int(source["magnitude"]))
            data['flux'] = data['flux'] * star_flux
        if source["spectrumType"] == "Galaxy":
            has_emission_line = False
            galaxy_flux = add_galaxy_spectrum(data['wavelength'], source['type'], source["age"], has_emission_line, int(source["magnitude"]), float(source["redshift"]))
            data['flux'] = data['flux'] * galaxy_flux
        if source["spectrumType"] == "Emission Line":
            emission_line_flux = add_emission_line(data['wavelength'], float(source["flux"]), float(source["centralWavelength"]), float(source["fwhm"]),  float(source["redshift"]))
            data['flux'] = data['flux'] * emission_line_flux

    if parameters["spectrumPlotOptions"]["includeAtmosphericExtinction"]:
        filename = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "nirskytransmission.csv"
        wavelength, spectrum = read_csv_file(filename)
        data['flux'] = data['flux'] * spectrum
    if parameters["source"]["type"] == "Point":
        if parameters["spectrumPlotOptions"]["calculateFluxInSeeingDisk"]:
            point_spread = 1 / (np.pi * float(parameters["earth"]["seeing"]) ** 2 / 4)
            data['flux'] = data['flux'] * point_spread
        else:
            diffuse = (np.pi * float(parameters["earth"]["seeing"]) ** 2 / 4)
            # generate_background_modifiers_list.append(diffuse)
    if parameters["spectrumPlotOptions"]["multiplyWithMirrorAreaAndEfficiency"] == "true":
        filename = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "combinedtelescope.csv"
        wavelength, spectrum = read_csv_file(filename)
        data['flux'] = data['flux'] * spectrum
        data['flux'] = data['flux'] * int(parameters["mirror_area"])

        # generate_spectra_modifiers_list.append(telescope)
        # generate_spectra_modifiers_list.append(mirror)
        # generate_background_modifiers_list.append(telescope)
        # generate_background_modifiers_list.append(mirror)

    return data['wavelength'], data['flux']


def get_spectrum_data(form_data):
    return get_modifiers(form_data)
