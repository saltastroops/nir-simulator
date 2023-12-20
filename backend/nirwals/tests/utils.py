from io import BytesIO

import numpy as np
import pytest
from astropy import units as u
from astropy.units import Quantity
from matplotlib.figure import Figure

from nirwals.configuration import (
    Configuration,
    Source,
    Sun,
    Moon,
    Telescope,
    Grating,
    Detector,
    Exposure,
    Blackbody,
)


def get_default_configuration() -> Configuration:
    """
    Return a default simulator configuration.

    Returns
    -------
    Configuration
        A default simulator configuration.
    """
    detector = Detector(
        full_well=83500, gain=2.04, read_noise=24.6, samplings=1, sampling_type="Fowler"
    )
    exposure = Exposure(exposures=1, exposure_time=100 * u.s, snr=None)
    moon = Moon(
        lunar_elongation=180 * u.deg, phase=90 * u.deg, zenith_distance=45 * u.deg
    )
    source = Source(
        extension="Point", spectrum=[Blackbody(magnitude=19, temperature=4000 * u.K)]
    )
    sun = Sun(ecliptic_latitude=0 * u.deg, solar_elongation=180 * u.deg, year=2023)
    telescope = Telescope(
        effective_mirror_area=460000 * u.cm**2,
        filter="Clear",
        grating=Grating(grating_angle=45 * u.deg, name="950"),
    )

    return Configuration(
        detector=detector,
        exposure=exposure,
        moon=moon,
        seeing=2 * u.arcsec,
        source=source,
        sun=sun,
        telescope=telescope,
        zenith_distance=37 * u.deg,
    )


def get_default_datafile() -> BytesIO:
    x = np.array([1000, 2000, 3000])
    y = np.array([1, 1, 1])
    content = BytesIO()
    np.savez(content, x=x, y=y)
    content.seek(0)
    return content


def create_matplotlib_figure(
    x: Quantity,
    y: Quantity,
    title: str = "",
    ylabel: str | None = None,
    left: float = 8000,
    right: float = 18000,
    bottom: float | None = None,
    top: float | None = None,
    xlog: bool = False,
    ylog: bool = False,
) -> Figure:
    """
    Create a matplotlib figure.

    This function has been adapted from the _do_plot method of Synphot's SourceSpectrum
    class.

    Parameters
    ----------
    x, y : `~astropy.units.quantity.Quantity`
        Wavelength and flux/throughput to plot.
    title: str, default: empty string
        Title of the figure.
    ylabel: str, default: None
        Label for the y-axis.
    left: float, default: 8000
        Minimum x value to display.
    right: float, default: 18000
        Maximum x value to display.
    bottom: float, optional
        Minimum y value to display.
    top: float, optional
        Maximum y value to display.
    xlog: bool, default: False
        Whether the x-axis should be logarithmic.
    ylog: bool, default: False
        Whether the y-axis should be logarithmic.

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
    elif xu.physical_type == "dimensionless":
        ax.set_xlabel("Unitless")
    else:
        ax.set_xlabel("Wavelength ({0})".format(xu))

    if ylabel:
        ax.set_ylabel(ylabel)
    else:
        yu = y.unit
        if yu is u.dimensionless_unscaled:
            ax.set_ylabel("Unitless")
        elif yu.physical_type == "time":
            ax.set_ylabel("Time ({0})".format(yu))
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
