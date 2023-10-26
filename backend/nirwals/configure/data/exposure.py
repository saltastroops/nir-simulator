import numpy as np
import csv
from pathlib import Path

from typing import Dict, Any, Tuple, List, Union
from scipy.special import erf
from os import getenv
from functools import lru_cache

from ..source.sources import ConstantModifier, VariableModifier, BlackBody, EmissionLine, Galaxy

# Telescope Constants
Ftel = 46200  # mm
Fcol = 630  # mm
Fcam = 220  # mm

FILES_BASE_DIR = Path(getenv("FILES_BASE_URL"))

# Define a type alias for modifiers
Modifier = Union[ConstantModifier, VariableModifier, BlackBody, EmissionLine, Galaxy]


@lru_cache
def read_csv_file(filename):
    with open(filename, 'r') as file:
        reader = csv.reader(file, delimiter=",", quotechar="|")
        data = list(reader)
        wavelength, modifier = zip(*[(float(x), float(y)) for x, y in data])
    return np.array(wavelength), np.array(modifier)


def get_affected_filenames(form_data):
    filenames = [
        FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "detectorqe.csv",
        FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "combinedtelescope.csv"
    ]
    if form_data["configuration_options"] == "imaging-mode":
        if form_data["filter"] == "clear-filter":
            filenames.append(FILES_BASE_DIR  / "data_sheets" /"adjusted_program_datasheets"/"clearfiltertransmission.csv")
        elif form_data["filter"] == "lwbf":
            filenames.append(FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "lwbftransmission.csv")
    elif form_data["configuration_options"] == "spectroscopy-mode":
        if form_data["filter"] == "clear-filter":
            filenames.append(FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "clearfiltertransmission.csv")
        elif form_data["filter"] == "lwbf":
            filenames.append(FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "lwbftransmission.csv")
        if form_data["grating"] == "950":
            filenames.append(
                FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / f"tempVPH{form_data['grating_angle']}.csv")
    return list(set(filenames))


def get_slit_modifier(constant):
    num_points = 40001
    wavelength = np.linspace(9000, 17000, 40001)
    modifier = np.full(num_points, constant, dtype=float)
    return wavelength, modifier


def get_data_sheets_directory() -> Path:
    return FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets"


def calculate_diffused_modifier(seeing: float) -> float:
    return np.pi * seeing ** 2 / 4


def get_filter_modifiers(filter_type: str, files_base: Path) -> List[Modifier]:
    if filter_type == "Clear Filter":
        return [VariableModifier(files_base / "clearfiltertransmission.csv")]
    elif filter_type == "LWBF":
        return [VariableModifier(files_base / "lwbftransmission.csv")]
    else:
        return []


def calculate_slit_losses(form_data: dict) -> float:
    return erf(
        (form_data["slit_width"] * np.sqrt(np.log(2)))
        / np.sqrt(
            0.6**2 + ((1 / np.cos(form_data["target_zd"])) ** (3 / 5) * form_data["seeing"]) ** 2
        )
    )


def get_default_modifiers(form_data: dict) -> List[Modifier]:
    files_base: Path = get_data_sheets_directory()
    modifiers: List[Modifier] = [
        ConstantModifier(form_data["effective_telescope_area"]),  # Mirror
        VariableModifier(files_base / "combinedtelescope.csv"),  # Telescope
        VariableModifier(files_base / "detectorqe.csv"),  # Detector
    ]

    if form_data["atm_extinction"]:
        modifiers.append(VariableModifier(files_base / "nirskytransmission.csv"))  # Sky Transmission

    if form_data["source"] == "Diffused":
        modifiers.append(ConstantModifier(calculate_diffused_modifier(form_data["seeing"])))

    modifiers.extend(get_filter_modifiers(form_data["filter"], files_base))

    if form_data['instrument_mode'] == "Spectroscopy":
        slit_losses = calculate_slit_losses(form_data)
        modifiers.append(ConstantModifier(slit_losses))

        if form_data["grating"] == 950:
            modifiers.append(VariableModifier(files_base / f"tempVPH{form_data['grating_angle']}.csv"))

    return modifiers


def adjust_spectra(source_list):
    num_points = 40001
    data = np.empty(num_points, dtype=[
        ('wavelength', float),
        ('spectrum', float),
        ('modifier', float)
    ])
    data['wavelength'] = np.linspace(9000, 17000, 40001)
    data['spectrum'] = np.ones(num_points)
    for source in source_list:
        _, modifier = source.get_spectrum()
        data['modifier'] = modifier
        data['spectrum'] = data['modifier'] * data['spectrum']
    return data['wavelength'], data['spectrum']


def create_spectra_source_list(form_data):
    source_list = get_default_modifiers(form_data)
    for source in form_data["sources"]:
        if source['name'] == "Black Boby":
            source_list.append(BlackBody(source))
        if source['name'] == "Emission Line":
            source_list.append(EmissionLine(source))
        if source['name'] == "Galaxy":
            source_list.append(Galaxy(source))
    return source_list


def imaging_solve_for_snr(form_data):
    signal_read_divisor = 12 if form_data["sampling"] == "Up The Ramp" else 2
    signal_read = form_data["read_noice"] / np.sqrt(form_data["number_of_samples"] / signal_read_divisor)
    seeing = form_data["seeing"]
    target_zd = form_data["target_zd"]
    exposure_time = form_data["exposure_time"]
    detector_iterations = form_data["detector_iterations"]

    wavelength, adjusted_spectrum = adjust_spectra(create_spectra_source_list(form_data))

    omega = (
        np.pi
        * (
            seeing * (1 / np.cos(target_zd * np.pi / 180)) ** (3 / 5)
        ) ** 2
        / 4
    )
    s_focalplane = 1 / Ftel * 180*3600 / np.pi
    s_detector = s_focalplane * Fcol / Fcam
    a_pix = 15 / 1000**2
    omega_pix = a_pix * (s_detector**2)
    n_target = sum(adjusted_spectrum) * omega_pix / omega
    n_background = sum(adjusted_spectrum) * omega_pix / omega  # TODO This should be a background spectrum not this one

    Q = (n_target * exposure_time * detector_iterations) / np.sqrt(
        (n_target + n_background) * detector_iterations * exposure_time
        + detector_iterations * signal_read**2
    )
    return {
        "signal_to_noise": Q,
        "wavelength": wavelength,
        "spectrum": adjusted_spectrum
    }


def spectroscopy_solve_for_snr():
    pass


def calculate_snr(form_data: Dict[str, Any]) -> Dict[str, Any]:

    if form_data["instrument_mode"] == "Imaging":
        return imaging_solve_for_snr(form_data)
        #  TODO there is no extra plot for this mode

    if form_data["instrument_mode"] == "Spectroscopy":
        spectroscopy_solve_for_snr()
        # TODO snr_per_bin_plot() method needs to be called
        # TODO This PR will only focus on imaging signal to noise plot only

    return {
        "s": 100,
        "w": [1, 2, 3, 4, 5],
        "e": [3, 5, 6, 2, 4]
    }
