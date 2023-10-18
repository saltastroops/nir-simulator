import { Spectrum } from "../../types";
import EmissionLine from "../../spectrum/EmissionLine";

let idCounter = 0;

interface Props {
  emissionLine: EmissionLine;
  update: (spectrum: Spectrum) => void;
}

export default function EmissionLinePanel({ emissionLine, update }: Props) {
  const parameters = emissionLine.parameters;
  const errors = emissionLine.errors();

  const updateParameter = (parameter: string, newValue: string) => {
    const updatedParameters = {
      ...parameters,
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
            value={parameters.centralWavelength}
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
            value={parameters.fwhm}
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
            value={parameters.flux}
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
            value={parameters.redshift}
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
