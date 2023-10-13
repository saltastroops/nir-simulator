import { Spectrum } from "../../types";

let idCounter = 0;

export interface EmissionLineSpectrum extends Spectrum {
  type: "Emission Line";
  parameters: {
    centralWavelength: number;
    fwhm: number;
    flux: number;
    redshift: number;
  };
  errors: Record<string, any>;
}

export function makeDefaultEmissionLine(): EmissionLineSpectrum {
  return {
    type: "Emission Line",
    parameters: {
      centralWavelength: 1800,
      fwhm: 1,
      flux: 1e-16,
      redshift: 0,
    },
    errors: {},
  };
}

interface Props {
  emissionLine: EmissionLineSpectrum;
  update: (spectrum: Spectrum) => void;
}

export default function EmissionLine({ emissionLine, update }: Props) {
  const { parameters, errors } = emissionLine;

  const updateCentralWavelength = (value: any) => {
    const minWavelength = 1000;
    const maxWavelength = 5000;
    const errorMessage = `The wavelength must be a number between ${minWavelength} and ${maxWavelength}.`;
    let error: string = undefined;
    const wavelength = parseFloat(value);
    if (isNaN(wavelength)) {
      error = errorMessage;
    }
    if (wavelength < minWavelength || wavelength > maxWavelength) {
      error = errorMessage;
    }
    const updatedErrors = {
      ...errors,
      centralWavelength: error,
    };
    const updatedParameters = {
      ...parameters,
      centralWavelength: wavelength,
    };
    update({
      type: "Emission Line",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  const updateFWHM = (value: any) => {
    const errorMessage = "The FWHM must be a positive number.";
    let error: string = undefined;
    const fwhm = parseFloat(value);
    if (isNaN(fwhm) || fwhm <= 0) {
      error = errorMessage;
    }
    const updatedErrors = {
      ...errors,
      fwhm: error,
    };
    const updatedParameters = {
      ...parameters,
      fwhm: fwhm,
    };
    update({
      type: "Emission Line",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  const updateFlux = (value: any) => {
    const errorMessage = "The flux must be a positive number.";
    let error: string = undefined;
    const flux = parseFloat(value);
    if (isNaN(flux) || flux <= 0) {
      error = errorMessage;
    }
    const updatedErrors = {
      ...errors,
      flux: error,
    };
    const updatedParameters = {
      ...parameters,
      flux: flux,
    };
    update({
      type: "Emission Line",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  const updateRedshift = (value: any) => {
    const minRedshift = -20;
    const maxRedshift = 20;
    const errorMessage = `The redshift must be a number between ${minRedshift} and ${maxRedshift}.`;
    let error: string = undefined;
    const redshift = parseFloat(value);
    if (isNaN(redshift)) {
      error = errorMessage;
    }
    if (redshift < minRedshift || redshift > maxRedshift) {
      error = errorMessage;
    }
    const updatedErrors = {
      ...errors,
      redshift: error,
    };
    const updatedParameters = {
      ...parameters,
      redshift: redshift,
    };
    update({
      type: "Emission Line",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  idCounter++;
  const centralWavelengthId = `centralWavelength-${idCounter}`;
  const fwhmId = `fwhm-${idCounter}`;
  const fluxId = `flux-${idCounter}`;
  const redshiftId = `redshift-${idCounter}`;

  return (
    <div className="flex flex-wrap items-top p-3">
      {/* central wavelength */}
      <div className="mr-5 w-48">
        <div>
          <label htmlFor={centralWavelengthId}>Central Wavelength</label>
        </div>
        <div>
          <input
            id={centralWavelengthId}
            className="input"
            type="number"
            value={parameters.centralWavelength}
            min={0}
            max={30}
            onChange={(event) => updateCentralWavelength(event.target.value)}
          />
        </div>
        {errors.centralWavelength && (
          <div className="text-red-700">{errors.centralWavelength}</div>
        )}
      </div>

      {/* FWHM */}
      <div className="w-48 mr-4">
        <div>
          <label htmlFor={fwhmId}>FWHM</label>
        </div>
        <div>
          <input
            id={fwhmId}
            className="input"
            type="number"
            value={parameters.fwhm}
            min={1000}
            max={15000}
            onChange={(event) => updateFWHM(event.target.value)}
          />
        </div>
        {errors.fwhm && <div className="text-red-700">{errors.fwhm}</div>}
      </div>

      {/* flux */}
      <div className="mr-5 w-48">
        <div>
          <label htmlFor={fluxId}>Flux</label>
        </div>
        <div>
          <input
            id={fluxId}
            className="input"
            type="number"
            value={parameters.flux}
            min={0}
            max={30}
            onChange={(event) => updateFlux(event.target.value)}
          />
        </div>
        {errors.flux && <div className="text-red-700">{errors.flux}</div>}
      </div>

      {/* Redshift */}
      <div className="mr-5 w-48">
        <div>
          <label htmlFor={redshiftId}>Redshift</label>
        </div>
        <div>
          <input
            id={redshiftId}
            className="input"
            type="number"
            value={parameters.redshift}
            min={0}
            max={30}
            onChange={(event) => updateRedshift(event.target.value)}
          />
        </div>
        {errors.redshift && (
          <div className="text-red-700">{errors.redshift}</div>
        )}
      </div>
    </div>
  );
}
