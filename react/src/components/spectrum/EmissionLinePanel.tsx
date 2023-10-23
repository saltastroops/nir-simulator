import { Spectrum } from "../../types";

let idCounter = 0;

interface EmissionLineParameters {
  centralWavelength: string;
  fwhm: string;
  flux: string;
  redshift: string;
}

export class EmissionLine implements Spectrum {
  public readonly spectrumType = "Emission Line";
  public centralWavelength = "13000";
  public fwhm = "100";
  public flux = "1e-16";
  public redshift = "0";

  public constructor(parameters?: EmissionLineParameters) {
    if (parameters) {
      this.centralWavelength = parameters.centralWavelength;
      this.fwhm = parameters.fwhm;
      this.flux = parameters.flux;
      this.redshift = parameters.redshift;
    }
  }

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // central wavelength
    const minWavelength = 9000;
    const maxWavelength = 17000;
    const centralWavelength = data.centralWavelength;
    if (
      Number.isNaN(centralWavelength) ||
      centralWavelength < minWavelength ||
      centralWavelength > maxWavelength
    ) {
      errors.centralWavelength = `The central wavelength must be a number between ${minWavelength} and ${maxWavelength}.`;
    }

    // FWHM
    const maxFWHM = 10000;
    const fwhm = data.fwhm;
    if (Number.isNaN(fwhm) || fwhm <= 0 || fwhm > maxFWHM) {
      errors.fwhm = `The FWHM must be a positive number less than ${maxFWHM}.`;
    }

    // flux
    const flux = data.flux;
    if (Number.isNaN(flux) || flux <= 0) {
      errors.flux = "The flux must be a positive number.";
    }

    // Redshift
    const redshift = data.redshift;
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
  }

  public get data() {
    return {
      centralWavelength: parseFloat(this.centralWavelength),
      fwhm: parseFloat(this.fwhm),
      flux: parseFloat(this.flux),
      redshift: parseFloat(this.redshift),
    };
  }
}

interface Props {
  emissionLine: EmissionLine;
  update: (spectrum: Spectrum) => void;
}

export default function EmissionLinePanel({ emissionLine, update }: Props) {
  const { centralWavelength, fwhm, flux, redshift } = emissionLine;
  const errors = emissionLine.errors;

  const updateParameter = (parameter: string, newValue: string) => {
    const updatedParameters = {
      centralWavelength,
      fwhm,
      flux,
      redshift,
      [parameter]: newValue,
    };
    update(new EmissionLine(updatedParameters));
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
            type="text"
            value={centralWavelength}
            onChange={(event) =>
              updateParameter("centralWavelength", event.target.value)
            }
          />
        </div>
        {errors.centralWavelength && (
          <div className="text-red-700">{errors.centralWavelength}</div>
        )}
      </div>

      {/* FWHM */}
      <div className="mr-5 w-48">
        <div>
          <label htmlFor={fwhmId}>FWHM</label>
        </div>
        <div>
          <input
            id={fwhmId}
            className="input"
            type="text"
            value={fwhm}
            onChange={(event) => updateParameter("fwhm", event.target.value)}
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
            type="text"
            value={flux}
            onChange={(event) => updateParameter("flux", event.target.value)}
          />
        </div>
        {errors.flux && <div className="text-red-700">{errors.flux}</div>}
      </div>

      {/* Redshift */}
      <div className="w-48">
        <div>
          <label htmlFor={redshiftId}>Redshift</label>
        </div>
        <div>
          <input
            id={redshiftId}
            className="input"
            type="text"
            value={redshift}
            onChange={(event) =>
              updateParameter("redshift", event.target.value)
            }
          />
        </div>
        {errors.redshift && (
          <div className="text-red-700">{errors.redshift}</div>
        )}
      </div>
    </div>
  );
}
