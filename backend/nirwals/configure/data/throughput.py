import csv
import pathlib
from functools import lru_cache

import numpy as np
from os import getenv
from scipy.special import erf

FILES_BASE_DIR = pathlib.Path(getenv("FILES_BASE_URL"))


#  TODO Caching should be done Correctly
@lru_cache
def read_csv_file(filename):
    with open(filename, 'r') as file:
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


def get_modifiers(form_data):
    num_points = 40001
    data = np.empty(num_points, dtype=[
        ('wavelength', float),
        ('throughput', float),
        ('modifier', float),
        ('modified_throughput', float)
    ])
    data['wavelength'] = np.arange(1, num_points + 1)
    data['throughput'] = np.ones(num_points)

    if form_data["configuration_options"] == "spectroscopy-mode":
        slit_width = float(form_data["slit_width"])
        target_zd = float(form_data["target_zd"])
        slit_losses = erf(
            (slit_width * np.sqrt(np.log(2))) / np.sqrt(
                0.6**2 + ((1 / np.cos(target_zd * np.pi / 180))**(3 / 5) * 1)**2))
        data['wavelength'], data['throughput'] = get_slit_modifier(slit_losses)

    for filename in get_affected_filenames(form_data):
        wavelength, modifier = read_csv_file(filename)
        data['wavelength'] = wavelength
        data['modifier'] = modifier
        data['throughput'] = data['modifier'] * data['throughput']

    return data['wavelength'], data['throughput']


def get_plot_data(form_data):
    return get_modifiers(form_data)