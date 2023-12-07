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

print(", ".join(grating_parameters)
```

## Converting atmospheric transmissions to extinction coeefficients

If a file with atmospheric transmission values is given, it can be converted to a file
containing atmospheric extinction coefficients with code like the following.

```python
import math
import pathlib

import numpy as np
from astropy import units as u

from nirwals.physics.utils import read_from_file


zenith_distance = 31 * u.deg

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
