import pathlib
import numpy as np
from astropy import units as u
from specutils import Spectrum1D
from os import getenv
from scipy.special import erf

from nirwals.utils import resample_spectrum, NUMBER_OF_POINTS, read_csv_file


FILES_BASE_DIR = pathlib.Path(getenv("FILES_BASE_DIR"))


def get_slit_modifier(constant):
    input_spectrum = Spectrum1D(
        spectral_axis=[9000, 17000] * u.AA,
        flux=[constant, constant] * u.Unit('erg cm-2 s-1 AA-1')
    )
    resampled_spectrum = resample_spectrum(input_spectrum)
    return resampled_spectrum.spectral_axis, resampled_spectrum.flux


def get_affected_filenames(form_data):
    filenames = [
        FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "detectorqe.csv",
        FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "combinedtelescope.csv"
    ]
    if form_data["configuration_options"] == "imaging-mode":
        if form_data["filter"] == "clear-filter":
            filenames.append(
                FILES_BASE_DIR / "data_sheets" /"adjusted_program_datasheets"/"clearfiltertransmission.csv"
            )
        elif form_data["filter"] == "lwbf":
            filenames.append(
                FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "lwbftransmission.csv"
            )
    elif form_data["configuration_options"] == "spectroscopy-mode":
        if form_data["filter"] == "clear-filter":
            filenames.append(
                FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "clearfiltertransmission.csv"
            )
        elif form_data["filter"] == "lwbf":
            filenames.append(
                FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "lwbftransmission.csv"
            )
        if form_data["grating"] == "950":
            filenames.append(
                FILES_BASE_DIR
                / "data_sheets"
                / "adjusted_program_datasheets"
                / f"tempVPH{form_data['grating_angle']}.csv"
            )
    return list(set(filenames))


def get_modifiers(form_data):
    data = np.empty(NUMBER_OF_POINTS, dtype=[
        ('wavelength', float),
        ('throughput', float),
        ('modifier', float)
    ])
    data['wavelength'] = np.linspace(9000, 17000, NUMBER_OF_POINTS) * u.AA
    data['throughput'] = np.ones(NUMBER_OF_POINTS) * u.Unit('erg cm-2 s-1 AA-1')

    if form_data["configuration_options"] == "spectroscopy-mode":
        slit_width = float(form_data["slit_width"])
        target_zd = float(form_data["target_zd"])
        slit_losses = erf(
            (slit_width * np.sqrt(np.log(2))) / np.sqrt(
                0.6**2 + ((1 / np.cos(target_zd * np.pi / 180))**(3 / 5) * 1)**2))
        data['throughput'] *= slit_losses

    for filename in get_affected_filenames(form_data):
        file_wavelength, file_flux = read_csv_file(filename)
        input_spectrum = Spectrum1D(
            spectral_axis=file_wavelength * u.AA,
            flux=file_flux * u.Unit('erg cm-2 s-1 AA-1')
        )
        resampled_spectrum = resample_spectrum(input_spectrum)
        data['modifier'] = resampled_spectrum.flux
        data['throughput'] = data['modifier'] * data['throughput']

    return data['wavelength'], data['throughput']


def get_plot_data(form_data):
    return get_modifiers(form_data)
