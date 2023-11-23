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
where $\sigma$ is the standard deviation. $\sigma$ can be expressed in terms of the full width at half maximum (FWHM) by means of the formula (cf. https://mathworld.wolfram.com/GaussianFunction.html)
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
The photon rate suffers losses related to various effects:

- Mirror efficiency
- Telescope throughput
- Grating efficiency
- Quantum efficiency of the detector
- Seeing

The first four effects can be described by means of a wavelength dependent factor, which is a product of a wavelength dependent factor for each of the three effects:
$$
n_{\rm propagated}(\lambda) = \epsilon_{\rm mirror}(\lambda)\,\epsilon_{\rm throughput}(\lambda)\,\epsilon_{\rm grating}(\lambda)\,\epsilon_{\rm QE}(\lambda)\,\dot{n}(\lambda)
$$

The mirror efficiency, the throughput efficiency and the quantum efficiency are all taken from csv files.

The grating efficiency is provided as a csv file for a list of grating angles. Let these angles be denoted by $\alpha_{i}$, and let $\lambda_{{\rm max},i}$ be the wavelength at which the trabnsmission curve for $\alpha_{i}$. Then we assume that the transmission at an angle $\alpha$ with $\alpha_{i} < \alpha < \alpha_{i+1}$ can be obtained by shifting the transmission curve for $\alpha_{i}$ by an amount of $((\alpha - \alpha_{i}) / (\alpha_{i + 1} - \alpha_{i})) (\lambda_{{\rm max},i+1} - \lambda_{{\rm max},i})$:
$$
\epsilon_{\rm grating}(\lambda, \alpha) = \epsilon_{\rm grating}\left(\lambda + \frac{\alpha - \alpha_{i}}{\alpha_{i+1} - \alpha_{i}}(\lambda_{{\rm max},i+1} - \lambda_{{\rm max},i})\right)
$$
This is a crude approximation, and will likely have to be revised.

### Seeing

#### Point source &dash; central fibre

We assume that atmospheric seeing can be modelled as a point source being spread out into a disk with a Gaussian profile,
$$
f(x, y) = \frac{1}{\sqrt{2\pi}\sigma_{\rm atm}}\exp\left(-\frac{x^{2}}{2\sigma_{\rm atm}^{2}}\right)\cdot\frac{1}{\sqrt{2\pi}\sigma_{\rm atm}}\exp\left(-\frac{y^{2}}{2\sigma_{\rm atm}^{2}}\right)\cdot\dot{n}
$$
Here $x$ and $y$ are angles (on the sky) in orthogonal directions, and $\sigma_{\rm atm}$ denotes the standard derivative. As both $x$ and $y$ are small, we can assume a flat geometry, and the angle $r$ between a point $(x, y)$ and the origin satisfies the relation
$$
r^{2} = x^{2} + y^{2}
$$
We thus get for the flux at the angle $r$:
$$
f(r) = \frac{1}{2\pi\sigma_{\rm atm}^{2}}\exp\left(-\frac{r^{2}}{2\sigma_{\rm atm}^{2{}}}\right)\cdot\dot{n}
$$
The standard deviation can be expressed in terms of the FWHM as
$$
\sigma_{\rm atm} = \frac{{\rm FWHM}_{\rm atm}}{2\sqrt{2\ln 2}}
$$
The FWHM is related to the Fried parameter $r_{0\lambda}$ (see chapter 6 of F. R. Chromey, To Measure the Sky: An Introduction to Observational Astronomy (second edition)):
$$
{\rm FWHM}_{\rm atm} \approx 0.2\left(\frac{\lambda}{1\ \mu{\rm m}}\right)\left(\frac{r_{0\lambda}}{1\ {\rm m}}\right)^{-1}
$$
The Fried parameter in turn is given by
$$
r_{0\lambda} = r_{0}\left(\frac{\lambda}{0.5\ \mu{\rm m}}\right)^{\frac{6}{5}}(\cos z)^{\frac{3}{5}}
$$
with the zemith distance $z$. Combining the last two equation, we get
$$
{\rm FWHM}_{\rm atm} \approx C\lambda^{1}\left(\lambda^{\frac{6}{5}}(\cos z)^{\frac{3}{5}}\right)^{-1} = C\lambda^{-\frac{1}{5}}(\sec z)^{\frac{3}{5}}
$$
with some constant C. The FWHM hence depends on the wavelength abd the zenith distance. We ignore the weak wavelength dependence and use the simpler relation
$$
{\rm FWHM}_{\rm atm}(z) = {\rm FWHM}_{\rm atm}(z=0)\,(\sec z)^{\frac{3}{5}}
$$
so that we can express the standard deviation as
$$
\sigma_{\rm atm}(z) = \frac{{\rm FWHM}_{\rm atm}(z=0)}{2\sqrt{2\ln 2}}(\sec z)^{\frac{3}{5}}
$$
${\rm FWHM}_{\rm atm}(z=0)$ must be supplied by the user.

There is diffraction and seeing at the teleacope itself as well, and as for the atmospheric seeing we assume these can be described by a Gaussian, with a standard derivative $\sigma_{\rm tel}$. We assume the FWHM to be 0.6 arcsec, so that
$$
\sigma_{\rm tel} = \frac{{\rm FWHM}_{\rm tel}}{2\sqrt{2\ln 2}} = \frac{0.3}{2\sqrt{2\ln 2}}
$$
The two standard deviations add up in quadrature,
$$
\sigma^{2} = \sigma_{\rm atm}^{2} + \sigma_{\rm tel}^{2}
$$
and in total we get the following flux for a point source with seeing:
$$
f(r) = \frac{1}{2\pi\sigma^{2}}\exp\left(-\frac{r^{2}}{2\sigma^{2{}}}\right)\cdot\dot{n}
$$
Now let us focus on the central fibre. This covers a disk $\Omega_{\rm fibre}$ on the sky, and we assume the point source to be at the centre of this disk. Let $r_{\rm fibre}$ be the angular radius of the disk. Then the integrated flux through $\Omega_{\rm fibre}$, i.e. the rate for the fibre, has the value
$$
\dot{n}_{\rm fibre} = \iint_{\Omega_{\rm fibre}}f(x, y){\rm d}x\,{\rm d}y = \int_{0}^{r_{\rm fibre}}f(r)\,2\pi r\,{\rm d}r = \int_{0}^{r_{\rm fibre}}\frac{\dot{n}}{2\pi\sigma^{2}}\exp\left(-\frac{r^{2}}{2\sigma^{2{}}}\right)\cdot\dot{n}\,2\pi r\,{\rm d}r = \frac{\dot{n}}{\sigma^{2}}\int_{0}^{r_{\rm fibre}}r\exp\left(-\frac{r^{2}}{2\sigma^{2}}\right)\,{\rm d}r
$$
Now if we introduce the variable $u \equiv r^{2} / (2\sigma^{2})$, we have
$$
\frac{{\rm d} u}{{\rm d}r} = \frac{2r}{2\sigma^{2}} = \frac{r}{\sigma^{2}}
$$
and hence
$$
\dot{n}_{\rm fibre} = \frac{\dot{n}}{\sigma^{2}}\int_{0}^{u_{\rm fibre}}r\,{\rm e}^{-u}\frac{{\rm d}r}{{\rm d}u}{\rm d}u = \frac{\dot{n}}{\sigma^{2}}\int_{0}^{u_{\rm fibre}}r\,{\rm e}^{-u}\frac{\sigma^{2}}{r}{\rm d}u = \dot{n}\int_{0}^{u_{\rm fibre}}{\rm e}^{-u}\,{\rm d}u = \dot{n}\,\left[-{\rm e}^{-u}\right]_{0}^{u_{\rm fibre}} = \dot{n}\,(-{\rm e}^{-u_{\rm fibre}} - (-{\rm e}^{0})) = (1 - {\rm e}^{-u_{\rm fibre}})\,\dot{n}
$$
Replacing $u$ with $r$ again, we thus finally get
$$
\dot{n}_{\rm fibre} = \left(1 - \exp\left(-\frac{r_{\rm fibre}^{2}}{2\sigma^{2}}\right)\right)\,\dot{n}
$$
with
$$
\sigma^{2} = \sigma_{\rm atm}^{2} + \sigma_{\rm tel}^{2} = \frac{1}{8\ln 2}\left(({\rm FWHM}_{\rm atm}(z = 0))^{2}(\sec z)^{\frac{6}{5}} + 0.6^{2}\right)
$$

#### Point source &dash; other fibers

For simplicity, we assume that for fibers other than the central one we assume that the flux the same everywhere across the fiber and that it is equal to the (real) flux through the fiber centre. (We thus underestimate the flux through the fibre.)

Now let $r_{i}$ be the angular distance between the centres of the $i$-th and the central fibre. Then with our assumption and the above equation for the flux in the seeing disk we get for the rate $\dot{n}_{i}$ through the $i$-th fibre:
$$
\dot{n}_{i} = A_{\rm fibre}\,f(r_{i}) = \pi r_{\rm fibre}^{2}\cdot\frac{1}{2\pi\sigma^{2}}\exp\left(-\frac{r_{i}^{2}}{2\sigma^{2{}}}\right)\cdot\dot{n} = \frac{r_{\rm fibre}^{2}}{2\sigma^{2}}\,\exp\left(-\frac{r_{i}^{2}}{2\sigma^{2{}}}\right)\cdot\dot{n}
$$

#### Diffuse source

For a diffuse flux we assume that the flux is constant and that the source is "infinite". Then each fibre loses flux due to seeing. But it also gains flux from its surroundings, and the two effects cancel exactly. Hence in this case seeing has no effect on the flux.

#### Realistic extended source

TBD.
