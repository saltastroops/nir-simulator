import { Spectrum } from "../types.ts";

interface EmissionLineParameters {
  centralWavelength: string;
  fwhm: string;
  flux: string;
  redshift: string;
}

export default class EmissionLine implements Spectrum {
  public readonly type = "Emission Line";
  public parameters = {
    centralWavelength: "13000",
    fwhm: "100",
    flux: "1e-16",
    redshift: "0",
  };

  public constructor(parameters?: EmissionLineParameters) {
    if (parameters) {
      this.parameters = parameters;
    }
  }

  public errors = () => {
    const errors: Record<string, string> = {};
    const parameters = this.typedParameters();

    // central wavelength
    const minWavelength = 9000;
    const maxWavelength = 17000;
    const centralWavelength = parameters.centralWavelength;
    if (
      Number.isNaN(centralWavelength) ||
      centralWavelength < minWavelength ||
      centralWavelength > maxWavelength
    ) {
      errors.centralWavelength = `The central wavelength must be a number between ${minWavelength} and ${maxWavelength}.`;
    }

    // FWHM
    const maxFWHM = 10000;
    const fwhm = parameters.fwhm;
    if (Number.isNaN(fwhm) || fwhm <= 0 || fwhm > maxFWHM) {
      errors.fwhm = `The FWHM must be a positive number less than ${maxFWHM}.`;
    }

    // flux
    const flux = parameters.flux;
    if (Number.isNaN(flux) || flux <= 0) {
      errors.flux = "The flux must be a positive number.";
    }

    // Redshift
    const redshift = parameters.redshift;
    const minRedshift = -20;
    const maxRedshift = 20;
    if (
      Number.isNaN(redshift) ||
      redshift < minRedshift ||
      redshift > maxRedshift
    ) {
      errors.redshift = `The redshift must be a number between ${minRedshift} and ${maxRedshift}.`;
    }

    return errors;
  };

  public typedParameters = () => ({
    centralWavelength: parseFloat(this.parameters.centralWavelength),
    fwhm: parseFloat(this.parameters.fwhm),
    flux: parseFloat(this.parameters.flux),
    redshift: parseFloat(this.parameters.redshift),
  });
}
