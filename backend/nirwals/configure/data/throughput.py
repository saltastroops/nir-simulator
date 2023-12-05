import csv
import os
import pathlib
from functools import lru_cache

import numpy as np
from scipy.special import erf

FILES_BASE_DIR = pathlib.Path(os.environ["FILES_BASE_DIR"])


#  TODO Caching should be done Correctly
@lru_cache
def read_csv_file(filename):
    with open(filename, "r") as file:
        reader = csv.reader(file, delimiter=",", quotechar="|")
        data = list(reader)
        wavelength, modifier = zip(*[(float(x), float(y)) for x, y in data])
    return np.array(wavelength), np.array(modifier)


def get_slit_modifier(constant):
    num_points = 40001
    wavelength = np.linspace(9000, 17000, 40001)
    modifier = np.full(num_points, constant, dtype=float)
    return wavelength, modifier


def get_affected_filenames(form_data):
    filenames = [
        FILES_BASE_DIR
        / "data_sheets"
        / "adjusted_program_datasheets"
        / "detectorqe.csv",
        FILES_BASE_DIR
        / "data_sheets"
        / "adjusted_program_datasheets"
        / "combinedtelescope.csv",
    ]
    if form_data["mode"] == "Imaging":
        if form_data["filter"] == "clear-filter":
            filenames.append(
                FILES_BASE_DIR
                / "data_sheets"
                / "adjusted_program_datasheets"
                / "clearfiltertransmission.csv"
            )
        elif form_data["filter"] == "lwbf":
            filenames.append(
                FILES_BASE_DIR
                / "data_sheets"
                / "adjusted_program_datasheets"
                / "lwbftransmission.csv"
            )
    elif form_data["mode"] == "Spectroscopy":
        if form_data["filter"] == "clear-filter":
            filenames.append(
                FILES_BASE_DIR
                / "data_sheets"
                / "adjusted_program_datasheets"
                / "clearfiltertransmission.csv"
            )
        elif form_data["filter"] == "lwbf":
            filenames.append(
                FILES_BASE_DIR
                / "data_sheets"
                / "adjusted_program_datasheets"
                / "lwbftransmission.csv"
            )
        if form_data["grating"] == "950":
            filenames.append(
                FILES_BASE_DIR
                / "data_sheets"
                / "adjusted_program_datasheets"
                / f"tempVPH{form_data['grating_angle']}.csv"
            )
    return list(set(filenames))


def get_modifiers(configuration):
    num_points = 40001
    data = np.empty(
        num_points,
        dtype=[
            ("wavelength", float),
            ("throughput", float),
            ("modifier", float),
            ("modified_throughput", float),
        ],
    )
    data["wavelength"] = np.arange(1, num_points + 1)
    data["throughput"] = np.ones(num_points)

    if configuration["mode"] == "Spectroscopy":
        slit_width = float(configuration["slit_width"])
        target_zd = float(configuration["target_zd"])
        slit_losses = erf(
            (slit_width * np.sqrt(np.log(2)))
            / np.sqrt(
                0.6**2 + ((1 / np.cos(target_zd * np.pi / 180)) ** (3 / 5) * 1) ** 2
            )
        )
        data["wavelength"], data["throughput"] = get_slit_modifier(slit_losses)

    for filename in get_affected_filenames(configuration):
        wavelength, modifier = read_csv_file(filename)
        data["wavelength"] = wavelength
        data["modifier"] = modifier
        data["throughput"] = data["modifier"] * data["throughput"]

    return data["wavelength"], data["throughput"]


def get_throughput_plot_data(configuration):
    return get_modifiers(configuration)
