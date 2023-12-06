from itertools import product
from typing import get_args

import numpy as np
import pytest

from astropy import units as u
from synphot import units, SpectralElement

from constants import ZERO_MAGNITUDE_FLUX, FLUX
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


def test_blackbody_normalisation():
    # 18th magnitude object
    config_mag18 = get_default_configuration()
    config_mag18.source.spectrum = [Blackbody(magnitude=18, temperature=4000 * u.K)]
    spectrum_mag18 = source_spectrum(config_mag18)

    # 13th magnitude object
    config_mag13 = get_default_configuration()
    config_mag13.source.spectrum = [Blackbody(magnitude=13, temperature=4000 * u.K)]
    spectrum_mag13 = source_spectrum(config_mag13)

    # A difference of 5 magnitudes corresponds to a flux ratio of 100.
    assert (
        pytest.approx(100 * spectrum_mag18(9000).to(units.PHOTLAM).value)
        == spectrum_mag13(9000).to(units.PHOTLAM).value
    )


def test_zero_magnitude():
    # 0th magnitude object
    config_mag0 = get_default_configuration()
    config_mag0.source.spectrum = [Blackbody(magnitude=0, temperature=4000 * u.K)]
    spectrum_mag0 = source_spectrum(config_mag0)

    # A 0th magnitude object should have the zero magnitude flux.
    J = SpectralElement.from_filter("johnson_j")
    F = (J * spectrum_mag0).integrate(flux_unit=units.FLAM)
    assert pytest.approx(F.to(FLUX).value) == ZERO_MAGNITUDE_FLUX.to(FLUX).value


@pytest.mark.mpl_image_compare
def test_emission_line():
    config = get_default_configuration()
    config.source.spectrum = [
        EmissionLine(
            central_wavelength=13000 * u.AA,
            fwhm=1000 * u.AA,
            redshift=0,
            total_flux=1e-13 * u.erg / (u.cm**2 * u.s),
        ),
    ]
    spectrum = source_spectrum(config)

    wavelengths = spectrum.waveset
    fluxes = spectrum(wavelengths)
    return create_matplotlib_figure(wavelengths, fluxes, title="Emission Line")


def test_emission_line_redshift():
    # Spectrum without redshift
    config_z0 = get_default_configuration()
    config_z0.source.spectrum = [
        EmissionLine(
            central_wavelength=13000 * u.AA,
            fwhm=1000 * u.AA,
            redshift=0,
            total_flux=1e-13 * u.erg / (u.cm**2 * u.s),
        ),
    ]
    spectrum_z0 = source_spectrum(config_z0)

    # Spectrum at redshift z=1
    z = 1
    config_z1 = get_default_configuration()
    config_z1.source.spectrum = [
        EmissionLine(
            central_wavelength=13000 * u.AA,
            fwhm=1000 * u.AA,
            redshift=z,
            total_flux=1e-13 * u.erg / (u.cm**2 * u.s),
        ),
    ]
    spectrum_z1 = source_spectrum(config_z1)

    # For a non-redshifted flux f and the same flux redshifted to z, the relation
    # f_z(x) = C * f(x / (1 + z) (with some constant C) holds. Hence, for two
    # wavelengths x1, x2 the relation
    # f_z(x2) / f_z(x1) = f(x2 / (1 + z)) / f(x1 / (1 + z)) must hold.
    x1 = 13000 * u.AA
    x2 = 12500 * u.AA
    ratio_z1 = float(spectrum_z1(x2) / spectrum_z1(x1))
    ratio_z0 = float(spectrum_z0(x2 / (1 + z)) / spectrum_z0(x1 / (1 + z)))
    assert pytest.approx(ratio_z1) == ratio_z0


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
        title=f"Galaxy ({galaxy_type}, {age.lower()}, "
        f"{'with' if with_emission_lines else 'without' } emission lines)",
    )


def test_galaxy_normalisation():
    # 18th magnitude object
    config_mag18 = get_default_configuration()
    config_mag18.source.spectrum = [
        Galaxy(
            age="Young",
            galaxy_type="Sa",
            magnitude=18,
            redshift=0,
            with_emission_lines=False,
        )
    ]
    spectrum_mag18 = source_spectrum(config_mag18)

    # 13th magnitude object
    config_mag13 = get_default_configuration()
    config_mag13.source.spectrum = [
        Galaxy(
            age="Young",
            galaxy_type="Sa",
            magnitude=13,
            redshift=0,
            with_emission_lines=False,
        )
    ]
    spectrum_mag13 = source_spectrum(config_mag13)

    # A difference of 5 magnitudes corresponds to a flux ratio of 100.
    assert (
        pytest.approx(100 * spectrum_mag18(9000).to(units.PHOTLAM).value)
        == spectrum_mag13(9000).to(units.PHOTLAM).value
    )


def test_galaxy_redshift():
    # Spectrum without redshift
    config_z0 = get_default_configuration()
    config_z0.source.spectrum = [
        Galaxy(
            age="Young",
            galaxy_type="Sa",
            magnitude=18,
            redshift=0,
            with_emission_lines=False,
        )
    ]
    spectrum_z0 = source_spectrum(config_z0)

    # Spectrum at redshift z=1
    z = 1
    config_z1 = get_default_configuration()
    config_z1.source.spectrum = [
        Galaxy(
            age="Young",
            galaxy_type="Sa",
            magnitude=18,
            redshift=z,
            with_emission_lines=False,
        )
    ]
    spectrum_z1 = source_spectrum(config_z1)

    # For a non-redshifted flux f and the same flux redshifted to z, the relation
    # f_z(x) = C * f(x / (1 + z) (with some constant C) holds. Hence, for two
    # wavelengths x1, x2 the relation
    # f_z(x2) / f_z(x1) = f(x2 / (1 + z)) / f(x1 / (1 + z)) must hold.
    x1 = 13000 * u.AA
    x2 = 12500 * u.AA
    ratio_z1 = float(spectrum_z1(x2) / spectrum_z1(x1))
    ratio_z0 = float(spectrum_z0(x2 / (1 + z)) / spectrum_z0(x1 / (1 + z)))
    assert pytest.approx(ratio_z1) == ratio_z0


@pytest.mark.mpl_image_compare
def test_composite_spectrum():
    config = get_default_configuration()
    config.source.spectrum = [
        Blackbody(magnitude=18, temperature=4000 * u.K),
        EmissionLine(
            central_wavelength=13000 * u.AA,
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
