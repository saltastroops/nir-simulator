import { Spectrum } from "../../types";

let idCounter = 0;

const galaxyTypes = ["E", "S0", "Sa", "Sb", "Sc", "Sd"];

const ages = ["Young", "Old"];

export interface GalaxySpectrum extends Spectrum {
  type: "Galaxy";
  parameters: {
    magnitude: string;
    type: string;
    age: string;
    redshift: string;
  };
  errors: {};
}

export function makeDefaultGalaxy(): GalaxySpectrum {
  return {
    type: "Galaxy",
    parameters: {
      magnitude: "20",
      type: "S0",
      age: "Young",
      redshift: "0",
    },
    errors: {},
  };
}

interface Props {
  galaxy: GalaxySpectrum;
  update: (spectrum: Spectrum) => void;
}

export default function Galaxy({ galaxy, update }) {
  const { parameters, errors } = galaxy;
  const updateMagnitude = (value: string) => {
    let error: string = undefined;
    const magnitude = parseFloat(value);
    if (isNaN(magnitude)) {
      error = "The magnitude must be a number.";
    }
    const updatedErrors = {
      ...errors,
      magnitude: error,
    };
    const updatedParameters = {
      ...parameters,
      magnitude: value,
    };
    update({
      type: "Galaxy",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  const updateType = (value: string) => {
    const errorMessage = `The type must be any of ${galaxyTypes.join(", ")}.`;
    let error: string = undefined;
    if (galaxyTypes.indexOf(value.trim()) === -1) {
      error = errorMessage;
    }
    const updatedErrors = {
      ...errors,
      type: error,
    };
    const updatedParameters = {
      ...parameters,
      type: value,
    };
    update({
      type: "Galaxy",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  const updateAge = (value: string) => {
    const errorMessage = `The age must be any of ${ages.join(", ")}.`;
    let error: string = undefined;
    if (ages.indexOf(value.trim()) === -1) {
      error = errorMessage;
    }
    const updatedErrors = {
      ...errors,
      age: error,
    };
    const updatedParameters = {
      ...parameters,
      age: value,
    };
    update({
      type: "Galaxy",
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
      redshift: value,
    };
    update({
      type: "Emission Line",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  idCounter++;
  const magnitudeId = `centralWavelength-${idCounter}`;
  const typeId = `fwhm-${idCounter}`;
  const ageId = `flux-${idCounter}`;
  const redshiftId = `redshift-${idCounter}`;

  return (
    <div className="flex flex-wrap items-top p-3">
      {/* magnitude */}
      <div className="mr-5 w-48">
        <div>
          <label htmlFor={magnitudeId}>Apparent Magnitude</label>
        </div>
        <div>
          <input
            id={magnitudeId}
            className="input"
            type="text"
            value={parameters.magnitude}
            onChange={(event) => updateMagnitude(event.target.value)}
          />
        </div>
        {errors.magnitude && (
          <div className="text-red-700">{errors.magnitude}</div>
        )}
      </div>

      {/* galaxy type */}
      <div className="mr-5">
        <div>
          <label htmlFor={typeId}>Type</label>
        </div>
        <div className="select">
          <select
            id={typeId}
            value={parameters.type}
            onChange={(event) => updateType(event.target.value)}
          >
            {galaxyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
            <option>TEST</option>
          </select>
        </div>
        {errors.type && <div className="text-red-700">{errors.type}</div>}
      </div>

      {/* age */}
      <div className="mr-5">
        <div>
          <label htmlFor={ageId}>Age</label>
        </div>
        <div className="select">
          <select
            id={ageId}
            value={parameters.age}
            onChange={(event) => updateAge(event.target.value)}
          >
            {ages.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
            <option>TEST</option>
          </select>
        </div>
        {errors.age && <div className="text-red-700">{errors.age}</div>}
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
