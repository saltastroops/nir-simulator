import csv


class Spectrum:
    def __init__(self):
        self.modified_spectra = []

    def adjust_spectrum(self, modifier_list):
        self.modified_spectra = self.spectra
        for item in modifier_list:
            self.modified_spectra = item.multiply(self.modified_spectra)

    def query_value(self, wavelength):
        lamb = round((float(wavelength) - 9000) * 5)
        return (self.wavelength[lamb], self.spectra[lamb])


class Modifier:
    def multiply(self, spectra):
        output = []
        for i in range(40001):
            output.append(self.modifier[i] * spectra[i])
        return output

    def query_value(self, wavelength):
        lamb = round((float(wavelength) - 9000) * 5)
        return (self.wavelength[lamb], self.modifier[lamb])


class VariableModifier:
    def __init__(self, filename, name):
        filereader = csv.reader(open(str(filename)), delimiter=",", quotechar="|")
        self.modifier = []
        self.wavelength = []
        self.name = str(name)
        for x, y in filereader:
            self.wavelength.append(float(x))
            self.modifier.append(float(y))

    def multiply(self, spectra):
        output = []
        for i in range(40001):
            output.append(self.modifier[i]*spectra[i])
        return output

    def query_value(self, wavelength):
        lamb = round((float(wavelength) - 9000) * 5)
        return (self.wavelength[lamb], self.modifier[lamb])


class ConstantModifier(Modifier):

    def __init__(self, constant, name):
        self.modifier = []
        self.wavelength = []
        self.name = str(name)
        for i in range(40001):
            self.wavelength.append(9000 + i / 5)
            self.modifier.append(float(constant))

    def multiply(self, spectra):
        output = []
        for i in range(40001):
            output.append(self.modifier[i] * spectra[i])
        return output

    def query_value(self, wavelength):
        lamb = round((float(wavelength) - 9000) * 5)
        return (self.wavelength[lamb], self.modifier[lamb])

# #    Background Spectrum, built off of plot of Mauna Kea NIR Sky Spectrum
# class Background(Spectrum):
#     def __init__(self):
#         self.refresh()
#
#     def refresh(self):
#         filereader = csv.reader(open("1-1-nirsky.csv"), delimiter=",", quotechar="|")
#         self.wavelength = []
#         self.spectra = []
#         for x, y in filereader:
#             self.wavelength.append(float(x))
#             self.spectra.append(float(y))
#
#
# #    Spectrum of source, built off of source list
# class Source(Spectrum):
#     def __init__(self):
#         self.wavelength = []
#         for i in range(40001):
#             self.wavelength.append(9000 + i / 5)
#
#     def refresh(self, sources):
#         self.spectra = []
#         for i in range(40001):
#             self.spectra.append(0)
#         for i in range(len(sources.source_list)):
#             if sources.source_list[i][1] == "star":
#                 T = sources.source_list[i][2]
#                 mag = sources.source_list[i][3]
#                 #  Star Spectrum
#                 # Plank Radiation law
#                 starrad = [
#                     (
#                             (2 * h * c**2)
#                             / (i**5)
#                             * 1
#                             / (math.exp((h * c) / (kb * T * i)) - 1)
#                             * 10**30
#                             * 1
#                             / (10**7)
#                     )
#                     for i in self.wavelength
#                 ]
#                 # Flux of a star with apparent magnitude = mag at 1.26 microns
#                 starmagflux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * mag)
#                 # create a normalization factor to normalize Flux at mag to match Planck Radiation Law
#                 normalizer = (starrad[18000]) / starmagflux
#                 # normalize steallar radiance to flux based upon apparent magnitude, ergs/sec/cm^2/angstrom
#                 starflux = [(starrad[i] / normalizer) for i in range(40001)]
#                 #  adjust for spread of light due to seeing
#                 #  decided to leave for a later part
#
#                 #  Adjust to photon count then add to spectra list
#                 photoncount = [
#                     (starflux[i] / ((h * c) / self.wavelength[i])) for i in range(40001)
#                 ]
#                 for i in range(40001):
#                     self.spectra[i] = self.spectra[i] + photoncount[i]
#
#             elif sources.source_list[i][1] == "emission line":
#                 lineflux = sources.source_list[i][4]
#                 lamda = sources.source_list[i][2]
#                 redshift = sources.source_list[i][5]
#                 centralwavelength = lamda * (1 + redshift)
#                 linefwhm = sources.source_list[i][3]
#                 linesig = linefwhm / 2.35
#
#                 # Gaussian line profile for flux, egs/sec/cm^2/arcsec^2/Angstrom
#                 lineprofile = [
#                     lineflux
#                     * 1
#                     / (linesig * math.sqrt(2 * math.pi))
#                     * math.exp(
#                         -(
#                                 (self.wavelength[i] - centralwavelength) ** 2
#                                 / (2 * linesig**2)
#                         )
#                     )
#                     for i in range(40001)
#                 ]
#
#                 for i in range(len(self.spectra)):
#                     # Convert to photon count, photons/sec/cm^2/arcsec^2/Angstrom
#                     self.spectra[i] = self.spectra[i] + lineprofile[i] / (
#                             (h * c) / self.wavelength[i]
#                     )
#
#             elif sources.source_list[i][1] == "custom":
#                 filename = sources.source_list[i][2]
#
#                 filereader = csv.reader(open(filename), delimiter=",", quotechar="|")
#                 for x, y in filereader:
#                     i = int((float(x) - 9000) * 5)
#                     self.spectra[i] = self.spectra[i] + float(y)
#
#             elif sources.source_list[i][1] == "galaxy":
#                 typ = sources.source_list[i][2]
#                 age = sources.source_list[i][3]
#                 emln = sources.source_list[i][4]
#                 mag = float(sources.source_list[i][5])
#                 redshift = sources.source_list[i][6]
#
#                 if typ == "E":
#                     if age == "Young":
#                         if emln == True:
#                             thisgal = young_e_emis
#                         elif emln == False:
#                             thisgal = young_e_no_emis
#                         else:
#                             pass
#                     elif age == "Old":
#                         if emln == True:
#                             thisgal = old_e_emis
#                         elif emln == False:
#                             thisgal = old_e_no_emis
#                         else:
#                             pass
#                     else:
#                         pass
#                 elif typ == "Sb":
#                     if age == "Young":
#                         if emln == True:
#                             thisgal = young_sb_emis
#                         elif emln == False:
#                             thisgal = young_sb_no_emis
#                         else:
#                             pass
#                     elif age == "Old":
#                         if emln == True:
#                             thisgal = old_sb_emis
#                         elif emln == False:
#                             thisgal = old_sb_no_emis
#                         else:
#                             pass
#                     else:
#                         pass
#                 elif typ == "Sa":
#                     if age == "Young":
#                         if emln == True:
#                             thisgal = young_sa_emis
#                         elif emln == False:
#                             thisgal = young_sa_no_emis
#                         else:
#                             pass
#                     elif age == "Old":
#                         if emln == True:
#                             thisgal = old_sa_emis
#                         elif emln == False:
#                             thisgal = old_sa_no_emis
#                         else:
#                             pass
#                     else:
#                         pass
#                 elif typ == "Sc":
#                     if age == "Young":
#                         if emln == True:
#                             thisgal = young_sc_emis
#                         elif emln == False:
#                             thisgal = young_sc_no_emis
#                         else:
#                             pass
#                     elif age == "Old":
#                         if emln == True:
#                             thisgal = old_sc_emis
#                         elif emln == False:
#                             thisgal = old_sc_no_emis
#                         else:
#                             pass
#                     else:
#                         pass
#                 elif typ == "Sd":
#                     if age == "Young":
#                         if emln == True:
#                             thisgal = young_sd_emis
#                         elif emln == False:
#                             thisgal = young_sd_no_emis
#                         else:
#                             pass
#                     elif age == "Old":
#                         if emln == True:
#                             thisgal = old_sd_emis
#                         elif emln == False:
#                             thisgal = old_sd_no_emis
#                         else:
#                             pass
#                     else:
#                         pass
#                 elif typ == "S0":
#                     if age == "Young":
#                         if emln == True:
#                             thisgal = young_s0_emis
#                         elif emln == False:
#                             thisgal = young_s0_no_emis
#                         else:
#                             pass
#                     elif age == "Old":
#                         if emln == True:
#                             thisgal = old_s0_emis
#                         elif emln == False:
#                             thisgal = old_s0_no_emis
#                         else:
#                             pass
#                     else:
#                         pass
#
#                 else:
#                     pass
#
#                 startingwavelength = 9000 / (1 + float(redshift))
#                 startingwavelength = 2 * round(startingwavelength / 2, 1)
#                 startingindex = thisgal.wavelength.index(startingwavelength)
#                 selection = []
#                 print(startingindex)
#                 for i in range(40001):
#                     selection.append(thisgal.flux[startingindex + i])
#
#                 galmagflux = 3.02 * 10 ** (-10) * 10 ** (-0.4 * mag)
#
#                 normalizer = selection[18001] / galmagflux
#
#                 galflux = [(selection[i] / normalizer) for i in range(40001)]
#
#                 photoncount = [
#                     (galflux[i] / ((h * c) / self.wavelength[i])) for i in range(40001)
#                 ]
#
#                 for i in range(40001):
#                     self.spectra[i] = self.spectra[i] + photoncount[i]
#
#             else:
#                 print("unknown source type found " + str(sources.source_list[i]))

