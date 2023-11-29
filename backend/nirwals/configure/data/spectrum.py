import pathlib
from synphot import SpectralElement
import numpy as np
from os import getenv
from specutils import Spectrum1D
from astropy import units as u
from nirwals.utils import read_csv_file

from synphot import SourceSpectrum
from synphot.models import BlackBodyNorm1D, GaussianFlux1D
from nirwals.utils import get_redshifted_spectrum, resample_spectrum

FILES_BASE_DIR = pathlib.Path(getenv("FILES_BASE_DIR"))

# J Bandpass constants
zero_magnitude_flux = 3.40 * 10 ** (-10) * u.erg / (u.cm ** 2 * u.s)
j_bandpass = SpectralElement.from_filter('johnson_j')


def apparent_magnitude_to_flux(magnitude, zero_mag_flux):
    return zero_mag_flux * 10**(-0.4 * magnitude)


def get_stellar_flux_values(wavelength: [], temperature: float, mag: float):

    bb = SourceSpectrum(BlackBodyNorm1D, temperature=temperature)

    star_blackbody_flux = bb(wavelength * u.AA)

    star_magnitude_flux = apparent_magnitude_to_flux(mag, zero_magnitude_flux.value) * u.erg/(u.cm**2 * u.s * u.AA)

    stellar_spectrum = Spectrum1D(spectral_axis=wavelength * u.AA, flux=star_blackbody_flux)

    normalized_stellar_spectrum = SourceSpectrum.from_spectrum1d(stellar_spectrum).normalize(star_magnitude_flux, j_bandpass)

    normalized_stellar_spectrum = normalized_stellar_spectrum.to_spectrum1d()

    return normalized_stellar_spectrum.photon_flux.value


def get_galaxy_flux_values(wavelength: [], galaxy_type: str, age: str, has_emission_line: bool, magnitude: float, redshift: float):
    galaxy_types = ["E", "Sb", "Sa", "Sc", "Sd", "S0"]
    age_types = ["Young", "Old"]

    if galaxy_type in galaxy_types and age in age_types:
        filename = f"{age}_{galaxy_type}_type_{'emission' if has_emission_line else 'no_emission'}.csv"
        file_path = FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / filename
        galaxy_wavelength, galaxy_flux = read_csv_file(file_path)

        galaxy_spectrum = Spectrum1D(spectral_axis=galaxy_wavelength * u.AA, flux=galaxy_flux*u.erg/(u.cm**2 * u.s * u.AA))

        galaxy_spectrum = SourceSpectrum.from_spectrum1d(galaxy_spectrum)

        redshifted_galaxy_spectrum = SourceSpectrum(galaxy_spectrum.model, z=redshift, z_type='conserve_flux')

        input_spectrum = redshifted_galaxy_spectrum.to_spectrum1d(galaxy_wavelength * u.AA)

        new_resampled_spectrum = resample_spectrum(input_spectrum)

        galaxy_magnitude_flux = apparent_magnitude_to_flux(magnitude, zero_magnitude_flux.value) * u.erg/(u.cm**2 * u.s * u.AA)

        normalized_galaxy_spectrum = SourceSpectrum.from_spectrum1d(new_resampled_spectrum).normalize(galaxy_magnitude_flux, j_bandpass)

        normalized_galaxy_spectrum = normalized_galaxy_spectrum.to_spectrum1d()

        return normalized_galaxy_spectrum.photon_flux.value


def get_emission_line_values(wavelength: [], flux: float, lamda: float, line_fwhm: float, redshift: float):

    emission_line_spectrum = SourceSpectrum(GaussianFlux1D, total_flux=flux*u.erg/(u.cm**2 * u.s), mean=lamda*u.AA, fwhm=line_fwhm*u.AA)

    redshifted_emission_line_spectrum = SourceSpectrum(emission_line_spectrum.model, z=redshift, z_type='conserve_flux')

    spectrum = redshifted_emission_line_spectrum.to_spectrum1d(wavelength*u.AA)

    return spectrum.photon_flux.value


def get_configured_background_sky_spectrum(parameters):
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


def get_configured_sources_spectrum(parameters):
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
