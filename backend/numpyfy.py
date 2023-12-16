# Script for converting the csv files into data files that can be read by numpy.
#
# The script searches for csv files in the directory specified by the environment
# variable FILE_BASE_DIR and its subdirectories. It reads in each csv file found and
# exports its data into a binary file in NumPy's .npz format.
#
# In more detail, each csv file is read in using AstroPy's ASCII reader. The first
# column is assigned to a variable x, and the second column to a variable y. Any
# further columns are ignored, and an error is raised if there are less than two
# columns. The data is then exported with NumPy's savez function, using "x" and "y" as
# the array names. The file is stored in the same directory as the original csv file,
# and it has the same name. Existing files are overwritten.

import os
import pathlib

import numpy as np
from astropy.io import ascii


def main():
    base_dir = pathlib.Path(os.environ["FILE_BASE_DIR"])
    csv_files = base_dir.glob("**/*.csv")
    for csv_file in csv_files:
        _export_to_npy(csv_file)


def _export_to_npy(csv_file: pathlib.Path) -> None:
    # Keep the user informed.
    print(f"Converting {csv_file}...")

    # Read in the data from the file
    data = ascii.read(csv_file)

    # Check that there are at least two columns.
    if len(data.colnames) < 2:
        raise ValueError(f"The data file has less than two columns: {csv_file}")

    # Warn the user if there are more than two columns.
    if len(data.colnames) > 2:
        raise ValueError(
            f"Columns other than the first and second are ignored for data file: "
            f"{csv_file}"
        )

    # Extract the data from the table returned by the ASCII reader.
    x = np.array(data[data.colnames[0]])
    y = np.array(data[data.colnames[1]])

    # Get the directory and filename for the file with the exported NumpPy data.
    parent = csv_file.parent
    filename = csv_file.stem + ".npz"

    # Export the data.
    export_path = parent / filename
    np.savez(export_path, x=x, y=y)


if __name__ == "__main__":
    main()
