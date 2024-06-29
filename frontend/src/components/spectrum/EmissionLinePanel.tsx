import { Spectrum } from "../../types";
import Errors from "../Errors.tsx";
import { input } from "../utils.ts";
import { SourceType } from "./SourceForm.tsx";

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

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  emissionLine: EmissionLine;
  sourceType: SourceType;
  update: (spectrum: Spectrum) => void;
}

export default function EmissionLinePanel({
  emissionLine,
  sourceType,
  update,
}: Props) {
  const { centralWavelength, fwhm, flux, redshift, errors } = emissionLine;

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
  const fluxUnits =
    sourceType == "Point" ? "erg/(cm² s Å)" : "erg/(cm² s arcsec² Å)";

  return (
    <div>
      {/* central wavelength */}
      <div className="field">
        <label htmlFor={centralWavelengthId}>Central Wavelength (Å)</label>
        <div className="control">
          <input
            id={centralWavelengthId}
            className={input("w-48")}
            type="text"
            value={centralWavelength}
            onChange={(event) =>
              updateParameter("centralWavelength", event.target.value)
            }
          />
        </div>
      </div>

      {/* FWHM */}
      <div className="field">
        <label htmlFor={fwhmId}>FWHM (Å)</label>
        <div className="control">
          <input
            id={fwhmId}
            className={input("w-48")}
            type="text"
            value={fwhm}
            onChange={(event) => updateParameter("fwhm", event.target.value)}
          />
        </div>
      </div>

      {/* flux */}
      <div className="field">
        <label htmlFor={fluxId}>Flux ({fluxUnits})</label>
        <div className="control">
          <input
            id={fluxId}
            className={input("w-48")}
            type="text"
            value={flux}
            onChange={(event) => updateParameter("flux", event.target.value)}
          />
        </div>
      </div>

      {/* Redshift */}
      <div className="field">
        <label htmlFor={redshiftId}>Redshift</label>
        <div className="control">
          <input
            id={redshiftId}
            className={input("w-48")}
            type="text"
            value={redshift}
            onChange={(event) =>
              updateParameter("redshift", event.target.value)
            }
          />
        </div>
      </div>

      {/* errors */}
      {emissionLine.hasErrors && (
        <Errors
          errors={errors}
          keys={["centralWavelength", "fwhm", "flux", "redshift"]}
        />
      )}
    </div>
  );
}
