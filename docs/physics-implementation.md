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
with the wavelength $\lambda$, the speed of light $c$, the Planck constant $h$, the Boltzmann constant $k_{\rm B}$, the temperature $T$ and a constant $C$. This flux is normalised for the J band and can be redshifted, as discussed below.

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

Spectra are provided in form of text files for E, S0, Sa, Sb, Sc and Sd, either with or without emission lines. Their flux is normalised for the J band and can be redshifted, as discussed below.

#### User-defined

A spectrum can be uploaded as a csv file containing wavelengths (in ${\rm\AA}$) and corresponding fluxes (in erg / (cm$^{2}$ s ${\rm\AA}$).

### Redshifting

In case of blackbody and galaxy spectra, the spectrum can be redshifted. The redshifted flux is given by
$$
f_{\rm redshifted}(\lambda) = \frac{1}{1 + z}f\left(\frac{\lambda}{1 + z}\right)
$$
with the redshift $z$.

### Normalising

After the redshift has been applied (see above), a blackbody or galaxy spectrum must be normalised so that its flux corresponds to a given J-band apparant magnitude.

Let $F$ be the total flux of $f(\lambda)$ after applying the  J filter and let $J(\lambda)$ be the bandpass (response) function for the J band. Then
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

Vega has the magnitude 0. Denoting its flux with $f_{\rm Vega}$, we get
$$
F_{0} = \int_{0}^{\infty}f_{\rm Vega}(\lambda)\,{\rm d}\lambda = 3.28\times 10^{-10}\ {\rm erg}\,{\rm cm}^{-2}\,{\rm s}
$$
where we have used the [Vega spectrum shipping with synphot](https://synphot.readthedocs.io/en/latest/synphot/spectrum.html#vega) and its `integrate` method to obtain the numerical value.

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

The background is read from a file. Currently solar and lunar properties are not taken into consideration.

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

- Telescope throughput, including the mirror efficiency
- Filter throughput
- Grating efficiency
- Quantum efficiency of the detector
- Seeing

The first four effects can be described by means of a wavelength dependent factor, which is a product of a wavelength dependent factor for each of the three effects:
$$
n_{\rm propagated}(\lambda) = \epsilon_{\rm telescope}(\lambda)\,\epsilon_{\rm filter}(\lambda)\,\epsilon_{\rm grating}(\lambda)\,\epsilon_{\rm QE}(\lambda)\,\dot{n}(\lambda)
$$

The telescope throughput, the filter throughput and the quantum efficiency are all taken from csv files.

The grating efficiency is provided as a csv file for a list of grating angles. Let these angles be denoted by $\alpha_{i}$, and let $\lambda_{{\rm max},i}$ be the wavelength at which the transmission curve for $\alpha_{i}$ reaches its maximum. Then we assume that the transmission at an angle $\alpha$ with $\alpha_{i} < \alpha < \alpha_{i+1}$ can be obtained by shifting the transmission curve for $\alpha_{i}$ by an amount of $((\alpha - \alpha_{i}) / (\alpha_{i + 1} - \alpha_{i})) (\lambda_{{\rm max},i+1} - \lambda_{{\rm max},i})$:
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
Here $x$ and $y$ are angles (on the sky) in orthogonal directions, and $\sigma_{\rm atm}$ denotes the standard deviation. As both $x$ and $y$ are small, we can assume a flat geometry, and the angle $r$ between a point $(x, y)$ and the origin satisfies the relation
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
with some constant C. The FWHM hence depends on the wavelength and the zenith distance. We ignore the weak wavelength dependence and use the simpler relation
$$
{\rm FWHM}_{\rm atm}(z) = {\rm FWHM}_{\rm atm}(z=0)\,(\sec z)^{\frac{3}{5}}
$$
so that we can express the standard deviation as
$$
\sigma_{\rm atm}(z) = \frac{{\rm FWHM}_{\rm atm}(z=0)}{2\sqrt{2\ln 2}}(\sec z)^{\frac{3}{5}}
$$
${\rm FWHM}_{\rm atm}(z=0)$ must be supplied by the user.

There is diffraction and seeing at the telescope itself as well, and as for the atmospheric seeing we assume these can be described by a Gaussian, with a standard deviation $\sigma_{\rm tel}$. We assume the FWHM to be 0.6 arcsec, so that
$$
\sigma_{\rm tel} = \frac{{\rm FWHM}_{\rm tel}}{2\sqrt{2\ln 2}} = \frac{0.6}{2\sqrt{2\ln 2}}
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
\dot{n}_{\rm fibre} = \iint_{\Omega_{\rm fibre}}f(x, y){\rm d}x\,{\rm d}y = \int_{0}^{r_{\rm fibre}}f(r)\,2\pi r\,{\rm d}r = \int_{0}^{r_{\rm fibre}}\frac{\dot{n}}{2\pi\sigma^{2}}\exp\left(-\frac{r^{2}}{2\sigma^{2{}}}\right)\cdot\dot{n}\cdot2\pi r\,{\rm d}r = \frac{\dot{n}}{\sigma^{2}}\int_{0}^{r_{\rm fibre}}r\exp\left(-\frac{r^{2}}{2\sigma^{2}}\right)\,{\rm d}r
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

For simplicity, we assume that for fibers other than the central one the flux is  the same everywhere across the fiber and that it is equal to the (real) flux through the fiber centre. (We thus underestimate the flux through the fibre.)

Now let $r_{i}$ be the angular distance between the centres of the $i$-th and the central fibre. Then with our assumption and the above equation for the flux in the seeing disk we get for the rate $\dot{n}_{i}$ through the $i$-th fibre:
$$
\dot{n}_{i} = A_{\rm fibre}\,f(r_{i}) = \pi r_{\rm fibre}^{2}\cdot\frac{1}{2\pi\sigma^{2}}\exp\left(-\frac{r_{i}^{2}}{2\sigma^{2{}}}\right)\cdot\dot{n} = \frac{r_{\rm fibre}^{2}}{2\sigma^{2}}\,\exp\left(-\frac{r_{i}^{2}}{2\sigma^{2{}}}\right)\cdot\dot{n}
$$

#### Diffuse source

For a diffuse flux we assume that the flux is constant and that the source is "infinite". Then each fibre stillloses flux due to seeing, but it also gains flux from its surroundings, and the two effects cancel exactly. Hence in this case seeing has no effect on the flux.

This in particular means that seeing does not affect the sky background.

#### Realistic extended source

TBD.

## Signal-to-noise ratio

Strictly speaking, defining a signal-to-noise ratio (SNR) for a specific wavelength is impossible, as the number of photons for a particular wavelength is 0. We thus have to define the SNR for a wavelength interval. A reasonable choice for that interval is the wavelength resolution $\Delta\lambda$. But we may also take the discrete nature of the CCD into account. For choosing an appropriate wavelength range we should thus answer two questions:

1. What is the wavelength resolution for the chosen NIRWALS configuration?
2. What is the wavelength range covered by a single CCD pixel? 

Let us start with the first question. The wavelength resolution is given by (see Section 11.4 of F. R. Chromey, To Measure the Sky: An Introduction to Observational Astronomy (second edition))
$$
\Delta\lambda = r_{\rm an}\phi_{\rm fibre}\frac{D_{\rm tel}}{D_{\rm col}}\frac{\sigma\cos\theta}{m}
$$
with the telescope aperture $D_{\rm tel}$, the diameter $D_{\rm col}$ of the collimator lens, the grating constant (groove spacing) $\sigma$ of the grating, the outgoing angle $\theta$ from the grating and the dispersion order $m$. The anamorphic magnification is
$$
r_{\rm an} = \frac{\cos\alpha}{\cos\theta}
$$
where $\alpha$ is the grating angle. The angular size of the fibre on the sky is
$$
\phi_{\rm fibre} = \frac{w_{\rm fibre}}{f_{\rm tel}}
$$
where $w_{\rm fibre}$ and $f_{\rm tel}$ are the width of the fibre and the focal length of the primary mirror, respectively. *$\phi_{\rm fibre}$ must be given in radians.* Assuming Littrow diffraction, we have $\theta = -\alpha$, and hence $\cos\theta = \cos\alpha$ and $r_{\rm an} = 1$, so that the equation for the resolution can be simplified:
$$
\Delta\lambda = \phi_{\rm fibre}\frac{D_{\rm tel}}{D_{\rm col
}}\sigma\cos\alpha
$$
But with the focal length $f_{\rm col}$ of the collimator we also have
$$
\frac{f_{\rm tel}}{D_{\rm tel}} = \frac{f_{\rm col}}{D_{\rm col}}
$$
and hence finally arrive at
$$
\Delta\lambda = \phi_{\rm fibre}\frac{f_{\rm tel}}{f_{\rm col}}\sigma\cos\alpha
$$
We may now turn to the second question above. A given CCD pixel records a wavelength range $[\lambda, \lambda + {\rm d}\lambda]$. To calculate ${\rm d}\lambda$, we start by noting that the parallel light beams outgoing from the grating are focussed by the camera lens onto the CCD. Let O be the point of the CCD on the optical axis. Then the light focused onto O has left the grating at an angle of $\theta$. However, the light reaching the CCD at a distance $x$ from O in spectral direction must have left the grating at a slightly different angle $\theta + {\rm d}\theta$. ${\rm d}\theta$ can be obtained from $x$ and the focal length $f_{\rm cam}$:
$$
\tan({\rm d}\theta) = \frac{x}{f_{\rm cam}}
$$
As $x \ll f_{\rm cam}$ we have $\tan({\rm d}\theta) \approx {\rm d}\theta$, and we can assume that
$$
{\rm d}\theta = \frac{x}{f_{\rm cam}}
$$
On the other hand, from the grating equation
$$
\frac{m\lambda}{\sigma} = \sin\alpha + \sin\theta
$$
we can infer that for the first order ($m=1$) we have
$$
\lambda = \sigma(\sin\alpha + \sin\beta)
$$
Hence a wavelength difference can be expressed as
$$
\begin{eqnarray*}
\lambda_{2} - \lambda_{1} & = & \sigma(\sin\alpha+\sin\theta_{2})  - \sigma(\sin\alpha + \sin\theta_{1})\\
& = & \sigma(\sin\theta_{2} - \
\sin\theta_{1})\\
& = & \sigma(\sin(\theta_{1} + (\theta_{2} - \theta_{1})) - \sin\theta_{1})\\
& = & \sigma(\sin\theta_{1}\cos(\theta_{2} - \theta_{1}) + \cos\theta_{1}\sin(\theta_{2}-\theta_{1}) - \sin\theta_{1})
\end{eqnarray*}
$$
So for the angles corresponding to two positions $x_{1}$, $x_{2}$ in spectral direction on the CCD we get
$$
\theta_{2} - \theta_{1} = {\rm d}\theta_{2} - {\rm d}\theta_{1} = \frac{x_{2}}{f_{\rm cam}} - \frac{x_{1}}{f_{\rm cam}} = \frac{x_{2} - x_{1}}{f_{\rm cam}}
$$
As $x_{2} - x_{1} \ll f_{\rm cam}$ we have $\theta_{2}  - \theta_{1} \ll 1$ and hence
$$
\begin{eqnarray*}
\lambda_{2} - \lambda_{1} & \approx & \sigma(\sin\theta_{1}\cdot 1 + \cos\theta_{1}\cdot(\theta_{2} - \theta_{1}) - \sin\theta_{1})\\
& = & \sigma\left(\cos\theta_{1}\cdot\frac{x_{2} - x_{1}}{f_{\rm cam}}\right)\\
& \approx & \sigma\left(\cos\theta\cdot\frac{x_{2}-x_{1}}{f_{\rm cam}}\right)
\end{eqnarray*}
$$
If we denote the CCD pixel size by $p$, we thus see that the CCD's wavelength resolution is
$$
{\rm d}\lambda = \frac{\sigma p\cos\theta}{f_{\rm cam}}
$$
We choose the wavelength range for calculating the SNR to be $\lambda - i\cdot{\rm d}\lambda / 2, \lambda + i\cdot{\rm d}\lambda / 2$, where $i$ is the smallest integer with $i\cdot{\rm d}\lambda \geq \Delta\lambda$:
$$
\sigma(\lambda) \equiv \sigma\left(\left[\lambda - \frac{i\cdot\lambda}{2}, \lambda + \frac{i\cdot\lambda}{2}\right]\right)
$$
We can now turn to calculating the SNR. Let $R$ be the readout noise per exposure. Then for Fowler sampling
$$
R_{\rm Fowler} = \frac{r^{2}}{s / 2}
$$

and for up-the-ramp sampling
$$
R_{\rm UpTheRamp} = \frac{r^{2}}{s / 12}
$$
In both cases $r$ and $s$ denote the read noise and number of samplings, respectively. *Note: These formulae will change.*

Let us also define
$$
N(\lambda, e, T) \equiv \int_{\lambda - i\cdot\lambda/2}^{\lambda+i\cdot\lambda/2}\dot{n}(\lambda){\rm d}\lambda \cdot e\,T \equiv C(\lambda)\cdot e\,T
$$
with the number of exposures $e%$ and the exposure time $T$ for a single exposure. Then the SNR is given by 
$$
\sigma(\lambda) = \frac{N_{\rm target}(\lambda, e, T)}{\sqrt{N_{\rm target}(\lambda, e, T) + N_{\rm sky}(\lambda, e, T) + eR}}
$$

We may also be interested in the exposure time required to achieve a given SNR. To get this time, we start from
$$
\sigma(\lambda) = \frac{C_{\rm target}(\lambda)\,e\,T}{\sqrt{C_{\rm target}(\lambda)\,e\,T +C_{\rm sky}(\lambda)\,e\,T + eR}}
$$
For simplicitly, wavelength dependence will not be explicitly mentioned in the following. Rearranging and squaring both sides gives
$$
\sigma^{2}(C_{\rm target}\,e\,T + C_{\rm sky}\,e\,T + eR) = C_{\rm target}^{2}e^{2}T^{2}
$$
and after some further rearranging we get
$$
T^{2} - \frac{\sigma^{2}(C_{\rm target} + C_{\rm sky})e}{C_{\rm target}^{2}e^{2}}T - \frac{\sigma^{2}eR}{C_{\rm target}^{2}e^{2}} = T^{2} - \frac{\sigma^{2}(C_{\rm target} + C_{\rm sky})}{C_{\rm target}^{2}e}T - \frac{\sigma^{2}R}{C_{\rm target}^{2}e} = 0
$$
With
$$
p \equiv -\frac{\sigma^{2}(C_{\rm target} + C_{\rm sky})}{C_{\rm target}^{2}e}
$$
and
$$
q \equiv -\frac{\sigma^{2}R}{C_{\rm target}^{2}e}
$$
the equation simplifies to
$$
T^{2} + p\,T + q = 0
$$
This is a quadratic equation, and its positive solution is
$$
T = -\frac{p}{2} + \sqrt{\left(\frac{p}{2}\right)^{2} - q}
$$

## Implementation

We use [synphot](https://synphot.readthedocs.io/en/latest/) for implementing the backend, and unless stated otherwise class and method names refer to this library.

In the following, the calculations are done for a single fibre.

### Spectra

All spectra are realised as `SourceSpectrum` instances. Where applicable, a normalised spectrum is generated with the `normalize` method. Synphot's Johnson-J bandpass is used for normalisation.

#### Blackbody

The `BlackBodyNorm1D` model is used with the user-supplied temperature and redshift. The resulting spectrum is normalised.

#### Emission line

The `Gaussian1D`model is used with the user-supplied flux, FWHM and redshift. The resulting spectrum is *not* normalised.

#### Galaxy

The galaxy spectrum is read from file into a `SourceSpectrum`. The user-supplied redshift is applied, and the resulting spectrum is normalised.

#### User-defined

The user-supplied data is read into a `SourceSpectrum`. The resulting spectrum is *not* normalised.

### Bandpasses

All throughput factors are handled in form of bandpass objects, i.e. `SpectrumElement` instances.

#### Atmospheric extinction

The extinction coefficient $\kappa(\lambda)$ is read from a file, and then the bandpass values are obtained by applying the formula $10^{-0.4\kappa(\lambda)\sec z}$.  This file may first have to be generated from another file which gives the transmission $t$ for a specific zenith distance $z$. To perform the conversion from $t$ to $\kappa$, we note that
$$
t(\lambda, z) = 10^{-0.4\kappa(\lambda)\,\sec z}
$$
and hence
$$
\lg t(\lambda, z) = -0.4\kappa(\lambda)\,\sec z
$$
We can thus convert by means of the following formula:
$$
\kappa(\lambda) = -\frac{\lg t(\lambda, z)}{0.4\sec z}
$$


#### Seeing

##### Point source

The bandpass for the central fibre is a `Flat` bandpass with amplitude
$$
\left(1 - \exp\left(-\frac{r_{\rm fibre}^{2}}{2\sigma^{2}}\right)\right)
$$
For all other fibres $i$ the bandpass is a `Flat` bandpass with amplitude
$$
\frac{r_{\rm fibre}^{2}}{2\sigma^{2}}\,\exp\left(-\frac{r_{i}^{2}}{2\sigma^{2{}}}\right)
$$
where $r_{i}$ is the (angular) distance between the centres of the central fibre and fibre $i$.

##### Diffuse source

The bandpass is a `Flat` bandpass with amplitude 1.

##### Background

The bandpass is a `Flat` bandpass with amplitude 1.

#### Mirror efficiency

The bandpass is created from data in a file.

#### Telescope throughput

The bandpass is created from data in a file.

#### Quantum efficiency

The bandpass is created from data in a file.

### Signal-to-noise ratio

The wavelength covered by a single CCD pixel is
$$
{\rm d}\lambda = \frac{\sigma p\cos\theta}{f_{\rm cam}}
$$
We create a binset from $\lambda_{\rm min} - 100\ {\rm\AA}$ to approximately $\lambda_{\rm max} + 100\ {\rm\AA}$ with a stepsize of ${\rm d}\lambda$. (The extra $100\ {\rm\AA}$ are added to avoid artifacts at the boundaries of the wavelength range of interest. ) We then create an `Observation` with the source spectrum (or background), the product of the throughput bandpasses as the bandpass, the user-supplied effective mirror area and the binset just calculated.

From the `Observation` we then get the fluxes at the bin centres. Let $n$ be the array of these fluxes and let $n_{k}$ be the array  you get by shifting $n$ $k$-times to the right (for $k \ge 0$) or to the left (for $k \lt 0$). "Gaps" resulting from shifting are filled with zeroes. Then (using trapezoidal intregration) we see that (apart from the first and last bin) the count rate $N[k]$ for the $k$-th bin is approximately
$$
N[k] = {\rm d}\lambda\left(\frac{n[k-1] + n[k]}{2} + \frac{n[k] + n[k+1]}{2}\right) = \frac{1}{2}{\rm d}\lambda\,(n[k-1] + 2 n[k] + n[k+1])
$$
So the array $N$ of count rates is given by
$$
N = \frac{1}{2}{\rm d}\lambda\,(n_{-1} +2n + n_{+1})
$$
The wavelength resolution is given by
$$
\Delta\lambda = \phi_{\rm fibre}\frac{f_{\rm tel}}{f_{\rm col}}\sigma\cos\alpha
$$
Now let $i$ be the smallest integer vwith $i\cdot{\rm d}\lambda \gt \Delta\lambda$. Then for calculating the SNR at one of the bin wavelengths $\lambda_{k}$, we need to add the count rates in the $i$ bins around that wavelength.

We therefore need to create a [sliding window view](https://numpy.org/devdocs/reference/generated/numpy.lib.stride_tricks.sliding_window_view.html) and then sum over the view's items. The resulting array $C$ will have $i-1$ fewer items than $N$. The count rate relevant for the SNR at $\lambda_{k}$ is $C[k - {\rm floor}(i / 2)]$. We therefore shift the binset by ${\rm floor}(i / 2)$ to the left. Then $C$ fulfills the role of $C(\lambda)$ in the formulae for the SNR discussed above. 

