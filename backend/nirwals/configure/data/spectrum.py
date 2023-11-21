import pathlib
from functools import lru_cache

import numpy as np
from os import getenv
from scipy.constants import Planck, speed_of_light, Boltzmann, Stefan_Boltzmann
from specutils import Spectrum1D
from specutils.manipulation import FluxConservingResampler
from specutils.analysis import line_flux
from astropy import units as u
from astropy.modeling.models import BlackBody, Gaussian1D
from nirwals.utils import get_redshifted_spectrum

FILES_BASE_DIR = pathlib.Path(getenv("FILES_BASE_DIR"))


# Universal Constants
h = Planck * 10**7    # joules*seconds -> erg*seconds
c = speed_of_light * 10**10
kb = Boltzmann * 10**7  # joules/kelvin -> erg/kelvin
sigma = Stefan_Boltzmann * 10**3    # watts/metres^2/Kelvin^4 -> erg/cm^2/seconds/Kelvin^4

conv = {
    0: lambda x: float(x),  # conversion fn for column 0
    1: lambda x: float(x),  # conversion fn for column 1
}


def apparent_magnitude_to_flux(magnitude, reference_flux=1.0):
    return reference_flux * 10**(-0.4 * magnitude)


def get_stellar_flux_values(wavelength: [], temperature: float, mag: float):

    blackbody = BlackBody(temperature=temperature*u.K, scale=1.0 * u.erg / (u.cm ** 2 * u.AA * u.s * u.sr))

    star_blackbody_flux = blackbody(wavelength * u.AA)

    star_blackbody_flux *= np.pi * u.sr

    reference_flux = 3.02 * 10 ** (-10)

    star_magnitude_flux = apparent_magnitude_to_flux(mag, reference_flux) * u.Unit('erg cm-2 s-1')

    input_wavelength = wavelength * u.AA

    stellar_spectrum = Spectrum1D(spectral_axis=input_wavelength, flux=star_blackbody_flux)

    normalizer = line_flux(stellar_spectrum) / star_magnitude_flux

    normalized_star_radiation = stellar_spectrum.divide(normalizer)

    photon_count = normalized_star_radiation.photon_flux

    return photon_count.value


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

        reference_flux = 3.02 * 10 ** (-10)

        galaxy_magnitude_flux = apparent_magnitude_to_flux(magnitude, reference_flux) * u.Unit('erg cm-2 s-1')

        normalizer = line_flux(new_resampled_spectrum)/galaxy_magnitude_flux

        normalized_galaxy_radiation = new_resampled_spectrum.divide(normalizer)

        photon_count = normalized_galaxy_radiation.photon_flux

        return photon_count.value


def get_emission_line_values(wavelength: [], line_flux: float, lamda: float, line_fwhm: float, redshift: float):

    redshifted_central_wavelength, redshifted_line_flux = get_redshifted_spectrum(lamda, line_flux, redshift)

    line_signal = line_fwhm / (2 * np.sqrt(2 * np.log(2)))

    line_amplitude = redshifted_line_flux * 1 / (line_signal * np.sqrt(2 * np.pi))

    spectral_model = Gaussian1D(amplitude=line_amplitude*u.Unit('erg cm-2 s-1 AA-1'), mean=redshifted_central_wavelength*u.AA, stddev=line_signal*u.AA)

    line_profile = spectral_model(wavelength*u.AA)

    normalized_line_profile = line_profile / (np.sqrt(2 * np.pi * line_signal**2))

    line_spectrum = Spectrum1D(spectral_axis=wavelength*u.AA, flux=normalized_line_profile)

    photon_count = line_spectrum.photon_flux

    return photon_count.value


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
