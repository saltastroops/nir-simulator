from itertools import product
from typing import get_args

import numpy as np
import pytest

from astropy import units as u
from astropy.units import Quantity

from nirwals.configuration import Blackbody, EmissionLine, GalaxyAge, GalaxyType, Galaxy
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
def test_blackbody():
    config = get_default_configuration()
    config.source.spectrum = [Blackbody(magnitude=18, temperature=4000 * u.K)]
    spectrum = source_spectrum(config)

    wavelengths = spectrum.waveset
    fluxes = spectrum(wavelengths)
    return create_matplotlib_figure(wavelengths, fluxes, title="Blackbody")


@pytest.mark.mpl_image_compare
def test_emission_line():
    config = get_default_configuration()
    config.source.spectrum = [
        EmissionLine(
            central_wavelength=30000 * u.AA,
            fwhm=1000 * u.AA,
            redshift=0,
            total_flux=1e-13 * u.erg / (u.cm**2 * u.s),
        ),
    ]
    spectrum = source_spectrum(config)

    wavelengths = spectrum.waveset
    fluxes = spectrum(wavelengths)
    return create_matplotlib_figure(wavelengths, fluxes, title="Emission Line")


@pytest.mark.skipif(
    "not config.getoption('--mpl') and not config.getoption('--mpl-generate-path')",
    reason="Only run when Matplotlib figures are tested",
)
@pytest.mark.mpl_image_compare
@pytest.mark.parametrize(
    "age, galaxy_type, with_emission_lines",
    product(get_args(GalaxyAge), get_args(GalaxyType), (True, False)),
)
def test_galaxy(age: GalaxyAge, galaxy_type: GalaxyType, with_emission_lines: bool):
    config = get_default_configuration()
    config.source.spectrum = [
        Galaxy(
            age=age,
            galaxy_type=galaxy_type,
            magnitude=18,
            redshift=0,
            with_emission_lines=with_emission_lines,
        )
    ]
    spectrum = source_spectrum(config)

    wavelengths = spectrum.waveset
    fluxes = spectrum(wavelengths)
    return create_matplotlib_figure(
        wavelengths,
        fluxes,
        title=f"Galaxy (${galaxy_type}, {age.lower()}, "
        f"{'with' if with_emission_lines else 'without' } emission lines)",
    )


@pytest.mark.mpl_image_compare
def test_composite_spectrum():
    config = get_default_configuration()
    config.source.spectrum = [
        Blackbody(magnitude=18, temperature=4000 * u.K),
        EmissionLine(
            central_wavelength=30000 * u.AA,
            fwhm=1000 * u.AA,
            redshift=0,
            total_flux=1e-13 * u.erg / (u.cm**2 * u.s),
        ),
    ]
    spectrum = source_spectrum(config)

    wavelengths = spectrum.waveset
    fluxes = spectrum(wavelengths)
    return create_matplotlib_figure(
        wavelengths, fluxes, title="Blackbody and Emission Line"
    )
