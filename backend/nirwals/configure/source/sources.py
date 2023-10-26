import csv
from functools import lru_cache
import pathlib
from os import getenv

import numpy as np
from typing import List, Tuple

FILES_BASE_DIR = pathlib.Path(getenv("FILES_BASE_URL"))

h = 6.62607 * 10 ** (-27)  # erg*seconds
c = 2.99792 * 10**18  # angstrom/second
kb = 1.38065 * 10 ** (-16)  # erg/kelvin


class Source:
    wavelength = []
    spectrum = []


class BlackBody(Source):
    def __init__(self, source_configuration):
        num_points = 40001
        self.apparent_magnitude = source_configuration["apparent_magnitude"]
        self.temperature = source_configuration["temperature"]
        self.wavelength = np.arange(1, num_points + 1)
        self.spectrum = np.ones(num_points)

    def get_spectrum(self) -> Tuple[List[float], List[float]]:
        #  Star Spectrum
        # Plank Radiation law
        star_radiance = [
            (
                    (2 * h * c**2)
                    / (i**5)
                    * 1
                    / (np.exp((h * c) / (kb * self.temperature * i)) - 1)
                    * 10**30
                    * 1
                    / (10**7)
            )
            for i in self.wavelength
        ]
        # Flux of a star with apparent magnitude = mag at 1.26 microns
        star_magnitude_flux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * self.apparent_magnitude)
        # create a normalization factor to normalize Flux at mag to match Planck Radiation Law
        normalizer = (star_radiance[18000]) / star_magnitude_flux
        # normalize steallar radiance to flux based upon apparent magnitude, ergs/sec/cm^2/angstrom
        star_flux = [(star_radiance[i] / normalizer) for i in range(40001)]
        #  adjust for spread of light due to seeing
        #  decided to leave for a later part

        #  Adjust to photon count then add to spectra list
        photoncount = [
            (star_flux[i] / ((h * c) / self.wavelength[i])) for i in range(40001)
        ]
        for i in range(40001):
            self.spectrum[i] = self.spectrum[i] + photoncount[i]

        return np.array(self.wavelength), np.array(self.spectrum)


class EmissionLine(Source):

    def __init__(self, source_configuration):
        num_points = 40001
        self.flux = source_configuration["flux"]
        self.central_wavelength = source_configuration["central_wavelength"] * (1 + source_configuration["redshift"])
        self.fwhm = source_configuration["fwhm"]
        self.redshift = source_configuration["redshift"]
        self.wavelength = np.arange(1, num_points + 1)
        self.spectrum = np.ones(num_points)

    def get_spectrum(self) -> Tuple[List[float], List[float]]:
        linesig = self.fwhm / 2.35

        # Gaussian line profile for flux, egs/sec/cm^2/arcsec^2/Angstrom
        line_profile = [
            self.flux
            * 1
            / (linesig * np.sqrt(2 * np.pi))
            * np.exp(
                -(
                        (self.wavelength[i] - self.central_wavelength) ** 2
                        / (2 * linesig**2)
                )
            )
            for i in range(40001)
        ]
        for i in range(len(self.spectrum)):
            # Convert to photon count, photons/sec/cm^2/arcsec^2/Angstrom
            self.spectrum[i] = self.spectrum[i] + line_profile[i] / (
                    (h * c) / self.wavelength[i]
            )

        return np.array(self.wavelength), np.array(self.spectrum)


class Galaxy(Source):
    def __init__(self, source_configuration) -> None:

        self.type = source_configuration["type"]
        self.age = source_configuration["age"]
        self.apparent_magnitude = source_configuration["apparent_magnitude"]
        self.redshift = source_configuration["redshift"]
        self.generate_emission_lines = source_configuration["generate_emission_lines"]

    def _filename(self):
        emission_line = "emission" if self.generate_emission_lines else " no_emission"
        return (FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" /
                f"{self.age}_{self.type}_type_{emission_line}.csv")

    @lru_cache
    def _read_csv_file(self):
        with open(self._filename(), 'r') as file:
            reader = csv.reader(file, delimiter=",", quotechar="|")
            data = list(reader)
            wavelength, flux = zip(*[(float(x), float(y)) for x, y in data])
        return np.array(wavelength[0:1] + wavelength[1::2]), np.array(flux[0:1] + flux[1::2])

    def get_spectrum(self) -> Tuple[List[float], List[float]]:
        return self._read_csv_file()


class ConstantModifier(Source):
    def __init__(self, constant):
        self.constant = constant
        self.wavelength = np.linspace(9000, 17000, 40001)

    def get_spectrum(self):
        return self.wavelength, np.full(40001, self.constant)


class VariableModifier(Source):
    def __init__(self, filename):
        self.filename = filename
        self.wavelength = np.linspace(9000, 17000, 40001)

    def get_spectrum(self):

        with open(self.filename, 'r') as file:
            reader = csv.reader(file, delimiter=",", quotechar="|")
            data = list(reader)
            wavelength, flux = zip(*[(float(x), float(y)) for x, y in data])
        return np.array(wavelength), np.array(flux)
