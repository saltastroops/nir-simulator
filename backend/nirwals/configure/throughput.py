import numpy as np


class ThroughputSpectra:
    def __init__(self):
        self.wavelength = np.linspace(9000, 17000, 40001)
        self.throughput = []
        self.spectra = np.ones(40001)
        self.modified_spectra = self.spectra

    def adjust_spectrum(self, modifier_list):
        for item in modifier_list:
            self.modified_spectra = item.multiply(self.modified_spectra)
