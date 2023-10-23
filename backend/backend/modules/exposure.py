import csv
from typing import List, Union, Tuple

import numpy as np


# Constants
h = 6.62607 * 10 ** (-27)  # erg*seconds
c = 2.99792 * 10**18  # angstrom/second
kb = 1.38065 * 10 ** (-16)  # erg/kelvin


# Galaxy class to store galaxy data
class Galaxy:
    def __init__(self, filename: str, name: str):
        self.filename = filename
        self.name = name
        self.wavelength = []  # Wavelength data
        self.flux = []  # Flux data


# Class to manage sources
class Sources:
    def __init__(self):
        self.source_list = []  # List to store different source types


# Source classes to represent different source types
class Star:
    def __init__(self, temperature: float, magnitude: float):
        self.type = "star"
        self.temperature = temperature
        self.magnitude = magnitude


class EmissionLine:
    def __init__(self, wavelength: float, fwhm: float, flux: float, redshift: float):
        self.type = "emission line"
        self.wavelength = wavelength
        self.fwhm = fwhm
        self.flux = flux
        self.redshift = redshift


class CustomData:
    def __init__(self, filename: str):
        self.type = "custom"
        self.filename = filename


class GalaxySource:
    def __init__(self, typ: str, age: str, emission_line: bool, magnitude: float, redshift: float):
        self.type = "galaxy"
        self.typ = typ
        self.age = age
        self.emission_line = emission_line
        self.magnitude = magnitude
        self.redshift = redshift


def get_background_spectrum() -> Tuple[List[float], List[float]]:
    with open("1-1-nirsky.csv", 'r') as file:
        filereader = csv.reader(file, delimiter=",", quotechar="|")
        data = np.array(list(filereader), dtype=float)

    wavelength = data[:, 0]
    spectra = data[:, 1]

    return wavelength.tolist(), spectra.tolist()


def adjust_spectra(sources: Sources) -> np.ndarray:
    spectra = np.zeros(40001)  # Initialize an array to store the resulting spectra
    wavelength = np.arange(9000, 20001, 0.5)  # Wavelength range

    # Load galaxy data from files
    galaxy_data = load_galaxy_data()

    for source in sources.source_list:
        if isinstance(source, Star):
            # Handle Star sources
            spectra = handle_star(source, wavelength, spectra)

        elif isinstance(source, EmissionLine):
            # Handle EmissionLine sources
            spectra = handle_emission_line(source, spectra)

        elif isinstance(source, CustomData):
            # Handle CustomData sources
            spectra = handle_custom_data(source, wavelength, spectra)

        elif isinstance(source, GalaxySource):
            # Handle GalaxySource sources
            spectra = handle_galaxy(source, wavelength, spectra, galaxy_data)

        else:
            print("Unknown source type found:", source.type)

    return spectra


# Function to handle Star sources
def handle_star(source, wavelength, spectra):
    temperature, mag = source.temperature, source.magnitude

    # Calculate star radiance using Planck's radiation law
    star_rad = (
            (2 * h * c**2)
            / (wavelength**5)
            / (np.exp((h * c) / (kb * temperature * wavelength)) - 1)
            * 10**30
            / (10**7)
    )

    # Flux of a star with apparent magnitude = mag at 1.26 microns
    star_mag_flux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * mag)

    # Create a normalization factor to normalize Flux at mag to match Planck Radiation Law
    normalizer = star_rad[18000] / star_mag_flux

    # Normalize stellar radiance to flux based upon apparent magnitude, ergs/sec/cm^2/angstrom
    star_flux = star_rad / normalizer

    # Adjust to photon count and add to spectra
    photon_count = star_flux / ((h * c) / wavelength)
    spectra += photon_count

    return spectra


# Function to handle EmissionLine sources
def handle_emission_line(source, spectra):
    wavelength, fwhm, flux, redshift = source.wavelength, source.fwhm, source.flux, source.redshift

    central_wavelength = wavelength * (1 + redshift)
    linesig = fwhm / 2.35

    line_profile = (
            flux * (1 / (linesig * np.sqrt(2 * np.pi))) *
            np.exp(-((wavelength - central_wavelength) ** 2 / (2 * linesig**2)))
    )

    # Adjust to photon count and add to spectra
    photon_count = line_profile / ((h * c) / wavelength)
    spectra += photon_count

    return spectra


# Function to handle CustomData sources
def handle_custom_data(source, wavelength, spectra):
    filename = source.filename
    custom_wavelength, custom_flux = load_custom_data(filename)
    spectra += np.interp(wavelength, custom_wavelength, custom_flux, left=0, right=0)

    return spectra


# Function to handle GalaxySource sources
def handle_galaxy(source, wavelength, spectra, galaxy_data):
    typ, age, emission_line, mag, redshift = (
        source.typ, source.age, source.emission_line, source.magnitude, source.redshift
    )
    current_galaxy = get_galaxy(typ, age, emission_line, galaxy_data)

    starting_wavelength = 9000 / (1 + float(redshift))
    starting_wavelength = 2 * round(starting_wavelength / 2, 1)

    starting_index = current_galaxy.wavelength.index(starting_wavelength)
    selection = current_galaxy.flux[starting_index:starting_index + 40001]
    galmagflux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * mag)

    normalizer = selection[18000] / galmagflux

    # Calculate normalized galaxy flux
    galflux = [s / normalizer for s in selection]

    # Calculate photon count
    photon_count = [g / ((h * c) / w) for g, w in zip(galflux, wavelength)]

    # Add photon count to spectra
    spectra += photon_count

    return spectra


# Function to get the appropriate galaxy spectrum based on type, age, and emission scenario
def get_galaxy(
        typ: str, age: str, emission_line: bool, galaxy_data: List[Tuple[str, str, bool, Galaxy]]
) -> Union[None, Galaxy]:
    for galaxy_typ, galaxy_age, galaxy in galaxy_data:
        if (
                typ == galaxy_typ and
                age == galaxy_age and
                emission_line == galaxy.emission_line
        ):
            return galaxy
    return None


# Function to load galaxy data for different types and scenarios
def load_galaxy_data() -> List[Tuple[str, str, bool, Galaxy]]:
    return [
        ("E", "Young", True, load_galaxy("Young_E_type_emission.csv")),
        ("E", "Young", False, load_galaxy("Young_E_type_no_emission.csv")),
        ("E", "Old", True, load_galaxy("Old_E_type_emission.csv")),
        ("E", "Old", False, load_galaxy("Old_E_type_no_emission.csv")),
        ("Sb", "Young", True, load_galaxy("Young_Sb_type_emission.csv")),
        ("Sb", "Young", False, load_galaxy("Young_Sb_type_no_emission.csv")),
        ("Sb", "Old", True, load_galaxy("Old_Sb_type_emission.csv")),
        ("Sb", "Old", False, load_galaxy("Old_Sb_type_no_emission.csv")),
        ("S0", "Young", True, load_galaxy("Young_Sb_type_emission.csv")),
        ("S0", "Young", False, load_galaxy("Young_Sb_type_no_emission.csv")),
        ("S0", "Old", True, load_galaxy("Old_Sb_type_emission.csv")),
        ("S0", "Old", False, load_galaxy("Old_Sb_type_no_emission.csv")),
        ("Sa", "Young", True, load_galaxy("Young_Sb_type_emission.csv")),
        ("Sa", "Young", False, load_galaxy("Young_Sb_type_no_emission.csv")),
        ("Sa", "Old", True, load_galaxy("Old_Sb_type_emission.csv")),
        ("Sa", "Old", False, load_galaxy("Old_Sb_type_no_emission.csv")),
        ("Sc", "Young", True, load_galaxy("Young_Sb_type_emission.csv")),
        ("Sc", "Young", False, load_galaxy("Young_Sb_type_no_emission.csv")),
        ("Sc", "Old", True, load_galaxy("Old_Sb_type_emission.csv")),
        ("Sc", "Old", False, load_galaxy("Old_Sb_type_no_emission.csv")),
        ("Sd", "Young", True, load_galaxy("Young_Sb_type_emission.csv")),
        ("Sd", "Young", False, load_galaxy("Young_Sb_type_no_emission.csv")),
        ("Sd", "Old", True, load_galaxy("Old_Sb_type_emission.csv")),
        ("Sd", "Old", False, load_galaxy("Old_Sb_type_no_emission.csv"))
    ]


# Function to load galaxy data from a file
def load_galaxy(filename: str) -> Galaxy:
    data = np.genfromtxt(filename, delimiter=",")
    wavelength = data[:, 0]
    flux = data[:, 1]
    galaxy = Galaxy(filename, filename)
    galaxy.wavelength = wavelength
    galaxy.flux = flux
    return galaxy


# Function to load custom data
def load_custom_data(filename: str) -> Tuple[np.ndarray, np.ndarray]:
    data = np.genfromtxt(filename, delimiter=",")
    custom_wavelength = data[:, 0]
    custom_flux = data[:, 1]
    return custom_wavelength, custom_flux


# Usage example
sources = Sources()
sources.source_list.append(Star(5800, 0))
sources.source_list.append(EmissionLine(6563, 10, 10, 0.1))
sources.source_list.append(CustomData("custom_data.csv"))
sources.source_list.append(GalaxySource("E", "Young", False, 0, 1))

resulting_spectra = adjust_spectra(sources)
print(resulting_spectra)
