from typing import Any, Dict

import numpy as np

from nirwals.configure.data.spectrum import get_sources_spectrum, get_sky_spectrum

from nirwals.configure.data.throughput import get_modifiers


# Telescope Constants
f_telescope = 46200  # mm
f_col = 630  # mm
f_cam = 220  # mm


def get_signal_read(number_of_samples: int, sampling: str) -> float:

    sampling_divisor = 0
    if sampling == "Up The Ramp":
        sampling_divisor = 12
    if sampling == "Fowler":
        sampling_divisor = 2
    if sampling_divisor == 0:
        raise ValueError("Failed to determine the sampling")
    if number_of_samples < 1:
        raise ValueError("Number of samples must be a natural number.")

    # return read_noise / np.sqrt(number_of_samples/sampling_divisor)
    return 0

def calculate_snr(form_data):
    pass


def solve_for_snr(form_data) -> Any:
    spectrum_form = form_data
    instrument_form = form_data["instrument_setup"]
    exposure_configuration_form = form_data["exposure_configuration"]
    omega = (  # loss due seeing
            np.pi
            * (
                    exposure_configuration_form["seeing"]
                    * (
                            1 / np.cos(exposure_configuration_form["target_zenith_distance"] * np.pi / 180)
                    ) ** (3 / 5)) ** 2
            / 4
    )
    s_focal_plane = 1 / f_telescope * 180 * 3600 / np.pi
    s_detector = s_focal_plane * f_col / f_cam
    apix = 15 / 1000 ** 2
    omega_pix = apix * (s_detector ** 2)
    lamb = 10 ** 6 / exposure_configuration_form["grating"]
    alpha = exposure_configuration_form["grating_angle"] / 180 * np.pi
    # calculate the resolution element
    delta_lambda = (
            (exposure_configuration_form["slit_width"] * np.pi)
            / (180 * 3600)
            * lamb
            * np.cos(alpha)
            * f_telescope
            / f_col
    )
    # round delta lambda to nearest fifth of an angstrom
    delta_lambda = 2 * round(delta_lambda / 2, 1)
    # list of numbers representing lower wavelength range for bins
    binlist = [(9000 + i / 10) for i in range(0, 80001, int(delta_lambda * 10))]
    bin_snr = []
    bin_span = int(delta_lambda / 0.2)
    bincount = 0

    wavelength, sources_flux_values1 = get_sources_spectrum(spectrum_form)
    _, sources_flux_values2 = get_modifiers(instrument_form)
    sources_flux_values = sources_flux_values1 * sources_flux_values2
    _, sky_flux_values = get_sky_spectrum(spectrum_form)
    signal_read = get_signal_read(
        int(exposure_configuration_form["sampling"]["number_of_samples"]),
        exposure_configuration_form["sampling"]["sampling_type"]
    )
    # return wavelength, sources_flux_values
    wl = []
    for i in range(len(binlist) - 1):
        source_quick_sum = 0
        sky_quick_sum = 0
        for n in range(bincount, bincount + bin_span):
            source_quick_sum = source_quick_sum + sources_flux_values[n]
            sky_quick_sum = sky_quick_sum + sky_flux_values[n]
        n_target = source_quick_sum * omega_pix / omega
        n_background = 0 * omega_pix / omega
        q = (
                    n_target
                    * int(exposure_configuration_form["exposure_time"])
                    * int(exposure_configuration_form["detector_iterations"])
            ) / np.sqrt(
            (n_target + n_background)
            * int(exposure_configuration_form["detector_iterations"])
            * int(exposure_configuration_form["exposure_time"])
            + int(exposure_configuration_form["detector_iterations"])
            * signal_read ** 2 if n_target + n_background > 0 else 1
        )

        wl.append(q)
        bin_snr.append(binlist[i])
        bincount = bincount + bin_span
    return bin_snr, wl


def snr_per_bin_data(snr_list):
    snr = snr_list
    # TODO Create the additional plot here
    x = [b for a, b in snr]
    snr_max = max(x)
    snr_min = min(x)
    wl = []
    snr_plot = []

    for wavelength, f in snr:
        wl.append(100 + (600 / 9000) * (wavelength - 8500))
        snr_plot.append(350 - (300 / (snr_max - snr_min)) * (f - snr_min))

    # TODO double check the line plot of additional plot with original code
    return wl, snr_plot


def snr_plot_data(form_data: Dict[str, Any]):

    return solve_for_snr(form_data)
