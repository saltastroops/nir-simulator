import pytest
from astropy import units as u

from nirwals.configuration import Configuration, Source, Sun, Moon, Telescope


def get_default_configuration():
    moon = Moon(
        lunar_elongation=180 * u.deg, phase=90 * u.deg, zenith_distance=45 * u.deg
    )
    source = Source(extension="Point", spectrum=[], zenith_distance=37 * u.deg)
    sun = Sun(ecliptic_latitude=0 * u.deg, solar_elongation=180 * u.deg, year=2023)
    telescope = Telescope(
        effective_mirror_area=460000 * u.cm**2,
        grating_angle=45 * u.deg,
        grating_groove_frequency=950 * u.mm**-1,
    )

    return Configuration(
        moon=moon, seeing=2 * u.arcsec, source=source, sun=sun, telescope=telescope
    )


def create_matplotlib_figure(
    x, y, title="", xlog=False, ylog=False, left=None, right=None, bottom=None, top=None
):  # pragma: no cover
    """
    Create a matplotlib figure.

    This function has been adapted from the _do_plot method of Synphot's SourceSpectrum
    class.

    Parameters
    ----------
    x, y : `~astropy.units.quantity.Quantity`
        Wavelength and flux/throughput to plot.

    kwargs
        See the plot method of Synphot's SourceSpectrum class.

    """
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        pytest.fail(
            "No matplotlib installation found; plotting disabled " "as a result."
        )

    fig, ax = plt.subplots()
    ax.plot(x, y)

    # Custom wavelength limits
    if left is not None:
        ax.set_xlim(left=left)
    if right is not None:
        ax.set_xlim(right=right)

    # Custom flux/throughput limit
    if bottom is not None:
        ax.set_ylim(bottom=bottom)
    if top is not None:
        ax.set_ylim(top=top)

    xu = x.unit
    if xu.physical_type == "frequency":
        ax.set_xlabel("Frequency ({0})".format(xu))
    else:
        ax.set_xlabel("Wavelength ({0})".format(xu))

    yu = y.unit
    if yu is u.dimensionless_unscaled:
        ax.set_ylabel("Unitless")
    else:
        ax.set_ylabel("Flux ({0})".format(yu))

    if title:
        ax.set_title(title)

    if xlog:
        ax.set_xscale("log")
    if ylog:
        ax.set_yscale("log")

    plt.draw()

    return fig
