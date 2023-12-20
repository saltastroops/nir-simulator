# NIRWALS Simulator

## Developer notes

### Running the simulator in development

Before running the simulator the first time, install the required packages.

```shell
cd backend
python -m pip install -r requirements.txt
```

Start the Django server.

```shell
cd backend
python manage.py runserver
```

Update the React files served by Django. The browser should automatically reload the page (if applicable), thanks to [django-browser-reload](https://github.com/adamchainz/django-browser-reload).

```shell
cd frontend
npm run build
```

Note: Currently files in the `public` folder won't be served by Django.

### Environment variables

The frontend requires the following environment variables.

| Environment variable    | Description                                                                                                               |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------|
| `VITE_BACKEND_BASE_URL` | Base URL for the backend. Example values might be http://localhost:800 for development or an empty string for production. |

See [https://vitejs.dev/guide/env-and-mode.html#modes](https://vitejs.dev/guide/env-and-mode.html#modes) for how to set environment variables.

The backend requires the following environment variables, which you may set in an `.env` file in the `backend` directory.

| Environment variable | Description                                                                                                               | Default       |
|----------------------|---------------------------------------------------------------------------------------------------------------------------|---------------|
| ALLOWED_HOSTS        | A list of strings representing the host/domain names that this Django site can serve, separated by whitespace characters. | Empty string. |
| DEBUG                | Whether to run the server in debug mode.                                                                                  | 0             |

The server is run in debug mode if and only if the `DEBUG` variable has the case-insensitive value "true", "yes" or "1".

### Development tools

* Python: black, ruff
* React: ESLint, Prettier

### Adding a new predefined spectrum

First, define a component for setting the spectrum parameters.

* Add the component in `src/components/spectrum`. The component has to accept two properties, namely `spectrum`, an object with the spectrum parameters (see below), and `update`, a function which must be called with the new parameters object whenever a parameter value is changed.
* The `spectrum` property must be a `Spectrum`, i.e. it must have the properties `type` and `parameters`, as well as the methods `errors` and `typedParameters`.
* The component should not keep state; the state is handled elsewhere in the Simulator. It should only communicate changes via the `update` function.
* Labels should have proper ids, and a counter should be used for ensuring uniqueness. 

Then in `src/components/spectrum/SourceForm.tsx` add the new component to `makeSpectrumForm` and the corresponding (initial) spectrum parameters to `makeSpectrum`.

Add the new spectrum type to the `SpectrumType` definition in `src/types.ts`.

Finally, add the new spectrum type to the `spectrumTypes` array in the `SpectrumSelector` component (in `src/components/spectrum/SpectrumSelector.tsx`).

### Testing

The tests use the `pytest-mpl` plugin for comparing plots. For this to work, you need to generate the baseline images first:

```shell
pytest --mpl-generate-path=baseline path/to/your/tests
```

You can then run (regression) tests on the plots by passing the `--mpl` and `--mpl-baseline-path` options:

```shell
pytest --mpl --mpl-baseline-path=baseline
```

At the time of writing, you cannot define the `mpl-baseline-path` option in the pytest INI file, but this is likely to change in the next release of pytest-mpl.

The regression tests for plots must be marked with the `pytest.mark.mpl_image_compare` decorator and must return a Matplotlib figure. A utility function for creating figures is provided. Here is an example test.

```python
import pytest

from astropy.units import Quantity

from nirwals.configuration import Blackbody
from nirwals.physics.spectrum import source_spectrum
from nirwals.tests.utils import get_default_configuration, create_matplotlib_figure


@pytest.mark.mpl_image_compare
def test_blackbody(temperature: Quantity):
    config = get_default_configuration()
    config.source.spectrum = [Blackbody(magnitude=18, temperature=temperature)]
    spectrum = source_spectrum(config)

    wavelengths = spectrum.waveset
    fluxes = spectrum(wavelengths)
    return create_matplotlib_figure(wavelengths, fluxes, title="Blackbody")
```

## Finding the maxima of grating efficiencies

The following code illustrates how you can find the wavelengths of the maxima for the
grating efficiency curves.

```python
import pathlib

import numpy as np

from astropy import units as u

from constants import get_file_base_dir
from nirwals.physics.utils import read_from_file

grating = "950"
available_angles = [30 * u.deg, 35 * u.deg, 40 * u.deg, 45 * u.deg, 50 * u.deg]
grating_parameters = []
for angle in available_angles:
    angle_value = round(angle.to(u.deg).value)
    path = pathlib.Path(
        get_file_base_dir()
        / "gratings"
        / grating
        / f"grating_{grating}_{angle_value}deg.csv"
    )
    with open(path, "rb") as f:
        wavelengths, efficiencies = read_from_file(f)
        efficiency_values = efficiencies.value
        index_of_maximum = np.argmax(efficiency_values)
        grating_parameters.append(
            f"({angle_value} * u.deg, {wavelengths[index_of_maximum].to(u.AA).value} * u.AA)"
        )

print(", ".join(grating_parameters))
```

## Converting atmospheric transmissions to extinction coefficients

If a file with atmospheric transmission values is given, it can be converted to a file
containing atmospheric extinction coefficients with code like the following.

```python
import math
import pathlib

import numpy as np
from astropy import units as u

from nirwals.physics.utils import read_from_file


airmass = 1.5
zenith_distance = math.acos(1 / airmass) * u.rad

path = pathlib.Path(
    "data/data_sheets/adjusted_program_datasheets/nirskytransmission.csv"
)

with open(path, "rb") as f:
    wavelengths, transmissions = read_from_file(f)

# Avoid infinite values due to taking the logarithm of 0.
for i in range(len(transmissions)):
    if transmissions[i] < 1e-10:
        transmissions[i] = 1e-10

# To convert from transmissions t to extinction coefficients kappa, we note that
# kappa = -lg(t) / 0.4 sec(z) = -2.5 cos(z) lg(t).
kappa_values = (
    -2.5 * math.cos(zenith_distance.to(u.rad).value) * np.log10(transmissions)
)

# Save the atmospheric extinction coefficients in a new file
out_path = "data/atmospheric_extinction_coefficients.csv"
with open(out_path, "w") as g:
    for w, k in zip(wavelengths, kappa_values):
        g.write(f"{w.to(u.AA).value},{k}\n")
```

## Converting data files to the required format

Using csv files for the data incurs a massive performance hit, and the performance of
the Simulator can be improved by orders of magnitude by using NumPy's data format. On
the other hand, csv files are more user-friendly. To allow for the best of both worlds,
a script `numpyfy.py` is provided, which converts all csv files in the data folder to
the required NumPy format. The data folder must be specified with the environment
variable `FILE_BASE_DIR`.

## Deployment

### Setting up the server

#### Setting up Docker

We assume the deployment server meets the following requirements:

1. It is running under the latest version of Ubuntu.
2. There is a user `nirwals`, and that user has sudo rights.
3. The server has the ip address simulator.salt.ac.za.

First, install an ssh key on the server, so that you can connect without having to provide a password. This can be done with the `ssh-copy-id` command, which must be run on your own machine:

```shell
ssh-copy-id nirwals@simulator.salt.ac.za
```

Log in to the server and [install Docker](https://docs.docker.com/engine/install/ubuntu/). Once it is installed, check that the inmstallation was successful.

```shell
sudo docker run hello-world
```

Add the nirwals user to the docker group, so that it can execute Docker without sudo.

```shell
sudo usermod -aG docker $USER
```

Check that this had the desired effect:

```shell
docker run hello-world
```

#### Cloning the repository

If the nirwals user has no ssh key yet, create one with the following command (substituting `nirwals@example.com` with the correct email address):

```shell
ssh-keygen -t ed25519 -C "nirwals@example.com"
```

[Add the key to the relevant GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) for the simulator's repository.

Go to the home directory and clone the repository's main branch.

```shell
cd ~
git clone --branch main --single-branch --recurse-submodules git@github.com:saltastroops/nir-simulator.git
```
