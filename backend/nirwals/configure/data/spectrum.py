import pathlib

import numpy as np
from os import getenv
from scipy.constants import Planck, speed_of_light, Boltzmann
from specutils import Spectrum1D
from specutils.manipulation import FluxConservingResampler
from astropy import units as u
from nirwals.utils import get_redshifted_spectrum, read_csv_file


FILES_BASE_DIR = pathlib.Path(getenv("FILES_BASE_DIR"))


# Universal Constants
h = Planck * 10**7    # joules*seconds -> erg*seconds
c = speed_of_light * 10**10
kb = Boltzmann * 10**7  # joules/kelvin -> erg/kelvin


def get_stellar_flux_values(wavelength: float, temperature: float, mag: float):
    star_black_body_radiation = ((2 * np.pi * h * c**2) / wavelength**5) * 1/(np.exp((h*c)/(wavelength*kb*temperature)) - 1)

    star_magnitude_flux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * mag)
    normalizer = max(star_black_body_radiation) / star_magnitude_flux

    normalized_star_radiation = star_black_body_radiation/normalizer
    photon_count = (normalized_star_radiation / ((h * c) / wavelength))
    return photon_count


def get_galaxy_flux_values(wavelength: [], galaxy_type: str, age: str, has_emission_line: bool, magnitude: float, redshift: float):
    galaxy_types = ["E", "Sb", "Sa", "Sc", "Sd", "S0"]
    age_types = ["Young", "Old"]

    if galaxy_type in galaxy_types and age in age_types:
        filename = f"{age}_{galaxy_type}_type_{'emission' if has_emission_line else 'no_emission'}.csv"
        file_path = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / filename
        galaxy_wavelength, galaxy_flux = read_csv_file(file_path)

        galaxy_wavelength, galaxy_flux = get_redshifted_spectrum(galaxy_wavelength, galaxy_flux, redshift)

        input_wavelength = galaxy_wavelength * u.AA
        input_flux = galaxy_flux * u.Unit('erg cm-2 s-1 AA-1')
        input_spectrum = Spectrum1D(spectral_axis=input_wavelength, flux=input_flux)

        resampler = FluxConservingResampler()

        new_disp_grid = wavelength * u.AA

        new_resampled_spectrum = resampler(input_spectrum, new_disp_grid)

        galaxy_magnitude_flux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * magnitude)

        normalizer = max(new_resampled_spectrum.flux) / galaxy_magnitude_flux

        normalized_star_radiation = new_resampled_spectrum.flux/normalizer
        photon_count = (normalized_star_radiation / ((h * c) / wavelength))

        return photon_count


def get_emission_line_values(wavelength: [], line_flux: float, lamda: float, line_fwhm: float, redshift: float):
    redshifted_central_wavelength, redshifted_line_flux = get_redshifted_spectrum(lamda, line_flux, redshift)
    line_signal = line_fwhm / 2.35

    line_profile = redshifted_line_flux * 1 / (line_signal * np.sqrt(2 * np.pi)) * np.exp(-((wavelength - redshifted_central_wavelength) ** 2 / (2 * line_signal**2)))

    photon_count = line_profile / ((h * c) / wavelength)
    return photon_count


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
    data['sources_flux'] = np.zeros(num_points)

    sources = parameters["source"]["spectrum"]

    for source in sources:
        if source["spectrumType"] == "Blackbody":
            star_flux = get_stellar_flux_values(data['wavelength'], float(source["temperature"]), float(source["magnitude"]))
            data['sources_flux'] = data['sources_flux'] + star_flux
        elif source["spectrumType"] == "Galaxy":
            has_emission_line = False
            galaxy_flux = get_galaxy_flux_values(data['wavelength'], source['type'], source["age"], has_emission_line, float(source["magnitude"]), float(source["redshift"]))
            data['sources_flux'] = data['sources_flux'] + galaxy_flux
        elif source["spectrumType"] == "Emission Line":
            emission_line_flux = get_emission_line_values(data['wavelength'], float(source["flux"]), float(source["centralWavelength"]), float(source["fwhm"]), float(source["redshift"]))
            data['sources_flux'] = data['sources_flux'] + emission_line_flux

    if parameters["spectrumPlotOptions"]["includeAtmosphericExtinction"]:
        filename = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "nirskytransmission.csv"
        wavelength, flux = read_csv_file(filename)
        data['sources_flux'] = data['sources_flux'] * flux
    if parameters["source"]["type"] == "Point":
        if parameters["spectrumPlotOptions"]["calculateFluxInSeeingDisk"]:
            point_spread = 1 / (np.pi * float(parameters["earth"]["seeing"]) ** 2 / 4)
            data['sources_flux'] = data['sources_flux'] * point_spread
    if parameters["spectrumPlotOptions"]["multiplyWithMirrorAreaAndEfficiency"]:
        filename = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "combinedtelescope.csv"
        wavelength, telescope_flux = read_csv_file(filename)

        data['sources_flux'] = data['sources_flux'] * telescope_flux
        data['sources_flux'] = data['sources_flux'] * int(parameters["earth"]["mirrorArea"])

    return data['wavelength'], data['sources_flux']
