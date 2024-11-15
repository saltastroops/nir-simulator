import { Spectrum } from "../../types";
import Errors from "../Errors.tsx";
import { input, select } from "../utils.ts";

let idCounter = 0;

export const GALAXY_TYPES = ["E", "S0", "Sa", "Sb", "Sc", "Sd"];

export const GALAXY_AGES = ["Young", "Old"];

interface GalaxyParameters {
  magnitude: string;
  type: string;
  age: string;
  redshift: string;
  withEmissionLines: boolean;
}

export class Galaxy implements Spectrum {
  public readonly spectrumType = "Galaxy";
  public magnitude = "18";
  public type = "S0";
  public age = "Young";
  public redshift = "0";
  public withEmissionLines = false;

  public constructor(parameters?: GalaxyParameters) {
    if (parameters) {
      this.magnitude = parameters.magnitude;
      this.type = parameters.type;
      this.age = parameters.age;
      this.redshift = parameters.redshift;
      this.withEmissionLines = parameters.withEmissionLines
    }
  }

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // magnitude
    const magnitude = data.magnitude;
    if (Number.isNaN(magnitude)) {
      errors.magnitude = "The magnitude must be a number.";
    }

    // type
    if (!GALAXY_TYPES.includes(data.type)) {
      errors.type = `The type must be one of ${GALAXY_TYPES.join(", ")}.`;
    }

    // age
    if (!GALAXY_AGES.includes(data.age)) {
      errors.age = `The type must be one of ${GALAXY_AGES.join(", ")}.`;
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
      magnitude: parseFloat(this.magnitude),
      type: this.type,
      age: this.age,
      redshift: parseFloat(this.redshift),
      withEmissionLines: this.withEmissionLines,
    };
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  galaxy: Galaxy;
  update: (spectrum: Spectrum) => void;
}

export default function GalaxyPanel({ galaxy, update }: Props) {
  const { magnitude, type, age, redshift, withEmissionLines, errors } = galaxy;

  const updateParameter = (parameter: string, newValue: string | boolean) => {
    const updatedParameters = {
      magnitude,
      type,
      age,
      redshift,
      withEmissionLines,
      [parameter]: newValue,
    };
    update(new Galaxy(updatedParameters));
  };

  idCounter++;
  const magnitudeId = `magnitude-${idCounter}`;
  const typeId = `fwhm-${idCounter}`;
  const ageId = `flux-${idCounter}`;
  const redshiftId = `redshift-${idCounter}`;
  const withEmissionLinesId = `withEmissionLines-${idCounter}`;

  return (
    <div>
      {/* magnitude */}
      <div className="field">
        <label htmlFor={magnitudeId}>Apparent Magnitude (J Band)</label>
        <div className="control">
          <input
            id={magnitudeId}
            className={input("w-48")}
            type="text"
            value={magnitude}
            onChange={(event) =>
              updateParameter("magnitude", event.target.value)
            }
          />
        </div>
      </div>

      {/* galaxy type */}
      <div className="field">
        <label htmlFor={typeId}>Type</label>
        <div className="control">
          <select
            id={typeId}
            value={type}
            className={select("w-48")}
            onChange={(event) => updateParameter("type", event.target.value)}
          >
            {GALAXY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* age */}
      <div className="field">
        <label htmlFor={ageId}>Age</label>
        <div className="control">
          <select
            id={ageId}
            value={age}
            className={select("w-48")}
            onChange={(event) => updateParameter("age", event.target.value)}
          >
            {GALAXY_AGES.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
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

      {/* with emission lines? */}
      <div>
        <label htmlFor={withEmissionLinesId} className="pt-6">
          <input
              id={withEmissionLinesId}
              type="checkbox"
              checked={withEmissionLines}
              onChange={(event) =>
                  updateParameter("withEmissionLines", event.target.checked)
              }
          />
          <span className="ml-2">Automatically add emission lines</span>
        </label>
      </div>

      {/* errors */}
      {galaxy.hasErrors && (
        <Errors
          errors={errors}
          keys={["magnitude", "type", "age", "redshift"]}
        />
      )}
    </div>
  );
}
