import numpy as np
from astropy import units as u
from synphot import units
from scipy.integrate import simpson

from nirwals.configure.data.spectrum import get_sky_spectrum, get_sources_spectrum
from nirwals.configure.data.throughput import get_configured_throughput_spectrum
from synphot import SourceSpectrum, SpectralElement, Observation, Empirical1D

pixel_size = 18 * u.micron
fibre_radius = (1.33/2) * u.arcsec
telescope_focal_length = 46200 * 1000 * u.micron  # mm
collimator_focal_length = 630 * 1000 * u.micron  # mm
camera_focal_length = 220 * 1000 * u.micron  # mm

num_points = 500


def target_spectrum(configuration):
    sources_wavelength, sources_flux = get_sources_spectrum(configuration)
    source_spectrum = SourceSpectrum(Empirical1D, points=sources_wavelength * u.AA, lookup_table=sources_flux * units.PHOTLAM)
    exposure_time = float(configuration["exposureConfiguration"]["exposureTime"]["singleExposureTime"]) * u.s

    throughput_wavelength, throughput = get_configured_throughput_spectrum(configuration)
    # throughput_spectrum = Spectrum1D(throughput * u.dimensionless_unscaled, throughput_wavelength * u.AA)
    throughput_spectrum = SourceSpectrum(Empirical1D, points=throughput_wavelength * u.AA, lookup_table=throughput)
    bp = SpectralElement(throughput_spectrum)

    sources_observation = Observation(source_spectrum, bp)

    area = float(configuration["earth"]["mirrorArea"]) * units.AREA
    sources_flux_count_rate = sources_observation(sources_observation.binset, flux_unit='count', area=area)
    target_counts = sources_flux_count_rate * exposure_time

    return sources_observation.waveset, target_counts.value


def get_imaging_mode_snr(configuration):
    sources_wavelength, sources_flux = get_sources_spectrum(configuration)
    source_spectrum = SourceSpectrum(Empirical1D, points=sources_wavelength * u.AA, lookup_table=sources_flux * units.PHOTLAM)

    sky_wavelength, sky_flux = get_sky_spectrum(configuration)
    sky_spectrum = SourceSpectrum(Empirical1D, points=sky_wavelength * u.AA, lookup_table=sky_flux * units.PHOTLAM)

    target_zd = float(configuration["earth"]["targetZenithDistance"])
    seeing = float(configuration["earth"]["seeing"]) * u.arcsec
    sigma_squared = (1 / (8*np.log(2))) * (seeing**2 * (1 / np.cos(target_zd * np.pi / 180))**(6/5) + (0.6*u.arcsec)**2)
    seeing_losses = 1 - np.exp(-fibre_radius**2/sigma_squared)

    source_spectrum = source_spectrum * seeing_losses

    throughput_wavelength, throughput = get_configured_throughput_spectrum(configuration)
    throughput_spectrum = SourceSpectrum(Empirical1D, points=throughput_wavelength * u.AA, lookup_table=throughput)
    bp = SpectralElement(throughput_spectrum)

    sources_observation = Observation(source_spectrum, bp)
    sky_background_observation = Observation(sky_spectrum, bp)
    area = float(configuration["earth"]["mirrorArea"]) * units.AREA
    sources_flux_counts = sources_observation(sources_observation.binset, flux_unit='count', area=area)
    sky_background_flux_counts = sky_background_observation(sky_background_observation.binset, flux_unit='count', area=area)

    exposure_time = float(configuration["exposureConfiguration"]["exposureTime"]["singleExposureTime"])
    iterations = int(configuration["exposureConfiguration"]["exposureTime"]["detectorIterations"])

    target_counts_rate = simpson(sources_flux_counts, sources_observation.binset)
    target_counts = target_counts_rate * iterations * exposure_time

    sky_counts_rate = simpson(sky_background_flux_counts, sky_background_observation.binset) * iterations * exposure_time
    sky_counts = sky_counts_rate * iterations * exposure_time

    sampling_type = configuration["exposureConfiguration"]["sampling"]["samplingType"]
    number_of_samples = int(configuration["exposureConfiguration"]["sampling"]["numberOfSamples"])

    denominator = number_of_samples/2 if sampling_type == "Fowler" else number_of_samples/12

    read_noise = int(configuration["exposureConfiguration"]["gain"]["readNoise"]) ** 2 / denominator
    snr = target_counts/np.sqrt(target_counts + sky_counts + iterations * read_noise)

    return snr


def get_spectroscopy_mode_snr(configuration):
    data = np.empty(num_points, dtype=[
        ('wavelength', float),
        ('snr', float),
    ])

    data['wavelength'] = np.linspace(9000, 17000, num_points)

    grating_constant = (1 / float(configuration["instrumentConfiguration"]["modeConfiguration"]["grating"])) * u.mm
    grating_angle = float(configuration["instrumentConfiguration"]["modeConfiguration"]["gratingAngle"]) * u.deg

    pixel_wavelength = (pixel_size * grating_constant * np.cos(grating_angle.to(u.rad))) / camera_focal_length

    binset = np.arange(min(data['wavelength']) - 100, max(data['wavelength']) + 100, pixel_wavelength.to(u.AA).value)

    sources_wavelength, sources_flux = get_sources_spectrum(configuration)
    source_spectrum = SourceSpectrum(Empirical1D, points=sources_wavelength * u.AA, lookup_table=sources_flux * units.PHOTLAM)

    sky_wavelength, sky_flux = get_sky_spectrum(configuration)
    sky_spectrum = SourceSpectrum(Empirical1D, points=sky_wavelength * u.AA, lookup_table=sky_flux * units.PHOTLAM)

    target_zd = float(configuration["earth"]["targetZenithDistance"])
    seeing = float(configuration["earth"]["seeing"]) * u.arcsec
    sigma_squared = (1 / (8*np.log(2))) * (seeing**2 * (1 / np.cos(target_zd * np.pi / 180))**(6/5) + (0.6*u.arcsec)**2)
    seeing_losses = 1 - np.exp(-fibre_radius**2/sigma_squared)

    source_spectrum = source_spectrum * seeing_losses

    throughput_wavelength, throughput = get_configured_throughput_spectrum(configuration)
    throughput_spectrum = SourceSpectrum(Empirical1D, points=throughput_wavelength * u.AA, lookup_table=throughput)
    bp = SpectralElement(throughput_spectrum)

    sources_observation = Observation(source_spectrum, bp, binset)
    sky_background_observation = Observation(sky_spectrum, bp, binset)

    area = float(configuration["earth"]["mirrorArea"]) * units.AREA
    sources_flux_counts = sources_observation.sample_binned(flux_unit='count', area=area)
    sky_background_flux_counts = sky_background_observation.sample_binned(flux_unit='count', area=area)

    exposure_time = float(configuration["exposureConfiguration"]["exposureTime"]["singleExposureTime"])
    iterations = int(configuration["exposureConfiguration"]["exposureTime"]["detectorIterations"])

    target_counts = sources_flux_counts * iterations * exposure_time

    sky_counts = sky_background_flux_counts * iterations * exposure_time

    sampling_type = configuration["exposureConfiguration"]["sampling"]["samplingType"]
    number_of_samples = int(configuration["exposureConfiguration"]["sampling"]["numberOfSamples"])

    denominator = number_of_samples/2 if sampling_type == "Fowler" else number_of_samples/12

    read_noise = int(configuration["exposureConfiguration"]["gain"]["readNoise"]) ** 2 / denominator

    snr = target_counts.value/np.sqrt(target_counts.value + sky_counts.value + exposure_time * read_noise)

    return binset, snr




