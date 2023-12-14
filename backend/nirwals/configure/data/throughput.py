import pathlib

import numpy as np
from os import getenv
from astropy import units as u
from synphot import SourceSpectrum, units
from astropy.modeling.functional_models import Const1D
from nirwals.utils import read_csv_file

FILES_BASE_DIR = pathlib.Path(getenv("FILES_BASE_DIR"))


def get_configuration_filenames(configuration):
    filenames = [
        FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "detectorqe.csv",
        FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "combinedtelescope.csv"
    ]
    if configuration["mode"] == "Imaging":
        if configuration["instrumentConfiguration"]["filter"] == "clear-filter":
            filenames.append(FILES_BASE_DIR  / "data_sheets" /"adjusted_program_datasheets"/"clearfiltertransmission.csv")
        elif configuration["filter"] == "lwbf":
            filenames.append(FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "lwbftransmission.csv")
    elif configuration["mode"] == "Spectroscopy":
        if configuration["filter"] == "clear-filter":
            filenames.append(FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "clearfiltertransmission.csv")
        elif configuration["filter"] == "lwbf":
            filenames.append(FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / "lwbftransmission.csv")
        if configuration["grating"] == "950":
            filenames.append(
                FILES_BASE_DIR / "data_sheets" / "adjusted_program_datasheets" / f"tempVPH{configuration['grating_angle']}.csv")
    return list(set(filenames))


def get_configured_throughput_spectrum(configuration):
    num_points = 40001
    data = np.empty(num_points, dtype=[
        ('wavelength', float),
        ('throughput', float),
    ])
    data['wavelength'] = np.linspace(9000, 17000, num_points)

    throughput_spectrum = SourceSpectrum(Const1D, amplitude=1 * units.THROUGHPUT)

    data['throughput'] = throughput_spectrum(data['wavelength'])

    if configuration["mode"] == "Spectroscopy":
        slit_width = float(configuration["slit_width"])
        target_zd = float(configuration["target_zd"]) * u.deg
        seeing = float(configuration["seeing"])
        sigma_squared = (1 / (8*np.log(2))) * (seeing**2 * (1 / np.cos(target_zd.to(u.rad)))**(6/5) + 0.6**2)
        slit_losses = 1 - np.exp(-(slit_width/2)**2/sigma_squared)

        spectroscopy_mode_spectrum = SourceSpectrum(Const1D, amplitude=slit_losses * units.THROUGHPUT)

        data['throughput'] = data['throughput'] * spectroscopy_mode_spectrum(data['wavelength'])

    for filename in get_configuration_filenames(configuration):
        wavelength, modifier = read_csv_file(filename)
        modifier_spectrum = SourceSpectrum(Const1D, amplitude=modifier * units.THROUGHPUT)

        data['wavelength'] = wavelength
        data['throughput'] = data['throughput'] * modifier_spectrum(wavelength)

    return data['wavelength'], data['throughput']
