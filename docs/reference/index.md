# Overview

The backend for the NIRWALS Simulator is implemented as a Django application. The code
for carrying out the simulations is found in four modules:

`nirwals.physics.bandpass`

: Functions for throughput calculations. [(View documentation.)](nirwals.physics.bandpass.md)

`nirwals.physics.exposure`

: Functions for signal-to-noise ratio calculations. [(View documentation.)](nirwals.physics.exposure.md)

`nirwals.physics.spectrum`

: Functions for generating the source and sky background spectra. [(View documentation.)](nirwals.physics.spectrum.md)

`nirwals.physics.utils`

: Utility functions. [(View documentation.)](nirwals.physics.bandpass.md)

If you are interested in the code for implementing the URL routes etc., you may have a look at the [project repository](https://github.com/saltastroops/nir-simulator.git).
