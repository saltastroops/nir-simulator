# The physics behind the simulator and its implementation

This document briefly outlines the physics behind the simulator, and how it is implemented.

## Before reaching the telescope

### Target spectra

The simulator offers various generic spectra.

#### Blackbody

A blackbody spectrum has the form
$$
f(\lambda) = \frac{C}{\lambda^{5}}\frac{1}{{\rm e}^{hc/\lambda k_{\rm B}T} - 1}
$$
with the wavelength $\lambda$, the speed of light $c$, the Boltzmann constant $k_{\rm B}$, the temperature $T$ and a constant $C$. This flux is normalised for the J band and can be redshifted, as discussed below.

#### Emission line

As a function of frequency $\nu$, a  thermal emission line has the form of a. Gaussian (cf. https://www.cv.nrao.edu/~sransom/web/Ch7.html):
$$
f(\nu) = \frac{F}{\sqrt{2\pi}\sigma_{\nu}}\exp\left(-\frac{1}{2}\frac{(\nu - \nu_{0})^{2}}{\sigma_{\nu}^{2}}\right)
$$
with the total flux $F$ in the line, the frequency $\nu_{0}$ of the maximum and the standard deviation $\sigma_{\nu}$. In terms of the wavelength $\lambda$, this flux can be expressed as
$$
f(\lambda) = \frac{Fc}{\sqrt{2\pi}\sigma_{\nu}\lambda^{2}}\exp\left(-\frac{c^{2}}{2\sigma_{\nu}}\left(\frac{1}{\lambda}-\frac{1}{\lambda_{0}}\right)^{2}\right)
  = \frac{Fc}{\sqrt{2\pi}\sigma_{\nu}\lambda^{2}}\exp\left(-\frac{c^{2}}{2\sigma_{\nu}}\left(\frac{\lambda_{0} - \lambda}{\lambda\lambda_{0}}\right)^{2}\right)
$$
where $\lambda_{0} = c / \nu_{0}$. But for all practical purposes, $\lambda_{0} - \lambda \ll \lambda_{0}$, and we can approximate the flux by
$$
f(\lambda) =\frac{Fc}{\sqrt{2\pi}\sigma_{\nu}\lambda_{0}^{2}}\exp\left(-\frac{c^{2}}{2\sigma_{\nu}}\left(\frac{\lambda_{0} - \lambda}{\lambda_{0}^{2}}\right)^{2}\right)
$$
This is again a Gaussian, and we can rewrite it as
$$
f(\lambda) = \frac{F}{\sqrt{2\pi}\sigma}\exp\left(-\frac{1}{2}\frac{(\lambda - \lambda_0)^{2}}{\sigma^{2}}\right)
$$
where $\sigma$ is the standard deviation. $\sigma$ can be expressed in terms of the full width at half maximuk FWHM by means of the formula (cf. https://mathworld.wolfram.com/GaussianFunction.html)
$$
\sigma = \frac{\rm FWHM}{2\sqrt{2\ln 2}}
$$

#### Galaxy

Spectra are provided in form of text files for E, S0, Sa, Sb, Sc and Sd. Their flux is normalised for the J band and can be redshifted, as discussed below.

#### User-defined

A spectrum can be uploaded as a csv file containing wavelengths and corresponding fluxes.

### Redshifting

In case of blackbody and galaxy spectra, the spectrum can be redshifted. The redshifted flux is given by
$$
f_{\rm redshifted}(\lambda) = \frac{1}{1 + z}f\left(\frac{\lambda}{1 + z}\right)
$$
with the redshift $z$.

### Normalising

After the redshift has been applied (see above), a blackbody or galaxy spectrum must be normalised so that its flux corresponds to a given J-band apparant magnitude.

Let $F$ be the total flux of $f(\lambda)$ after applying the  J filter and let $J(\lambda)$ be vthe response function for the J band. Then
$$
F = \int_{0}^{\infty}J(\lambda)f_{\rm redshifted}(\lambda)\,{\rm d}\lambda
$$
Let $F_{0}$ be the flux for $m_{\rm J} = 0$. Then the total flux $F_{m}$ for the magnitude $m$ is given by
$$
\frac{F_{m}}{F_{0}} = 10^{-0.4(m_{\rm J} - 0)}
$$
and hence
$$
F_{m} = 10^{-0.4m_{\rm J}}\,F_{0}
$$
The normalised flux then is given by
$$
f_{\rm normalised}(\lambda) = \frac{F_{m}}{F} f_{\rm redshifted}(\lambda)
$$

### A note on symbols

In the following, $f$ refers to the flux after redshifting and normalising (if applicable).

### Atmospheric extinction

The (apparent) magnitude of a target changes from $m_{0}(\lambda)$ to $m(\lambda)$ as the light is passing through the atmosphere. These are related through (see http://star-www.rl.ac.uk/docs/sc6.htx/sc6se8.html)
$$
m(\lambda) = m_{0}(\lambda) + \kappa(\lambda)X(z)
$$
with the extinction coefficient $\kappa$, the air mass $X$ and the zenith distance $z$. We assume a constant density and a plane atmosphere, so that $X(z) \approx \sec z$ and thus
$$
m(\lambda) = m_{0}(\lambda) + \kappa(\lambda)\sec z
$$
Using the formula $m_{2} - m_{1} = -2.5\lg(f_{2} / f_{1})$ and rearranging, we get
$$
f(\lambda) = 10^{-0.4(m(\lambda) - m_{0}(\lambda))}f_{0}(\lambda) = 10^{-0.4\kappa(\lambda)\sec z}f_{0}(\lambda)
$$
Hence atmospheric extinction can be described with a modification factor
$$
\epsilon_{\rm atm}(\lambda) = 10^{-0.4\kappa(\lambda)\sec z}
$$
 The extinction coefficient $\kappa$ is provided by means of a csv file.

## Background

TBD

## Propagation through the telescope

So far we have considered the flux of energy. In order to convert this into a rate $\dot{n}$ of photons, we have to multiply with the (effective) mirror area $A_{\rm mirror}$ and use
$$
\dot{n}(\lambda) = A_{\rm mirror}\frac{{\rm d}N}{{\rm d}A\,{\rm d}\lambda\,{\rm d}t} = A_{\rm mirror}\frac{{\rm d}N}{{\rm d}E}\frac{{\rm d}E}{{\rm d}A\,{\rm d}\lambda\,{\rm dt}} = A_{\rm mirror}\frac{{\rm d}N}{{\rm d}E}f(\lambda)
$$
As the energy $E$ is the product of the energy $E_{\rm photon}$ of a single photon and the number $N$ of photon and as $E_{\rm photon} = hc / \lambda$, we have
$$
dE = E_{\rm photon}{\rm d}N = \frac{hc}{\lambda}{\rm d}N
$$
and hence
$$
\dot{n}(\lambda) = A_{\rm mirror} \frac{\lambda}{hc}f(\lambda)
$$
The photon rate suffers various losses related to various effects:

- Mirror efficiency
- Throughput
- Quantum efficiency of the detector
- Seeing

The first three effects can be described by means of a wavelength dependent factor, which is a product of awavelength dependent factor for each of the three effects:
$$
n_{\rm propagated}(\lambda) = \epsilon_{\rm mirror}(\lambda)\,\epsilon_{\rm throughput}(\lambda)\,\epsilon_{\rm QE}(\lambda)\,\dot{n}(\lambda)
$$



$$

$$
