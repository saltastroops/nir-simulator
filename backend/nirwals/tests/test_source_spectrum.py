import numpy as np
import pytest

from astropy import units as u
from astropy.units import Quantity

from nirwals.configuration import Blackbody
from nirwals.physics.spectrum import source_spectrum
from nirwals.tests.utils import get_default_configuration, create_matplotlib_figure


@pytest.mark.mpl_image_compare
def test_no_source():
    config = get_default_configuration()
    config.source.spectrum = []
    spectrum = source_spectrum(config)

    # The waveset property is undefined for a constant source spectrum, hence we have to
    # explicitly define wavelengths
    wavelengths = np.linspace(8000, 17000, 2) * u.AA
    fluxes = spectrum(wavelengths)

    return create_matplotlib_figure(wavelengths, fluxes, title="No Spectrum")


@pytest.mark.mpl_image_compare
def test_blackbody(temperature: Quantity):
    config = get_default_configuration()
    config.source.spectrum = [Blackbody(magnitude=18, temperature=temperature)]
    spectrum = source_spectrum(config)

    wavelengths = spectrum.waveset
    fluxes = spectrum(wavelengths)
    return create_matplotlib_figure(wavelengths, fluxes, title="Blackbody")
