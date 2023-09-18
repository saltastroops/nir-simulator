
class ThroughputSpectra:
    def __init__(self):
        self.wavelength = []
        self.throughput = []
        self.spectra = []
        self.modified_spectra = self.spectra
        for i in range(40001):
            self.wavelength.append(9000 + i / 5)
            self.spectra.append(1)

    def adjust_spectrum(self, modifier_list):
        for item in modifier_list:
            self.modified_spectra = item.multiply(self.modified_spectra)

