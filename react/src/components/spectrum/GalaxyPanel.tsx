import { Spectrum } from "../../types";

let idCounter = 0;

export const GALAXY_TYPES = ["E", "S0", "Sa", "Sb", "Sc", "Sd"];

export const GALAXY_AGES = ["Young", "Old"];

interface GalaxyParameters {
  magnitude: string;
  type: string;
  age: string;
  redshift: string;
}

export class Galaxy implements Spectrum {
  public readonly spectrumType = "Galaxy";
  public magnitude = "18";
  public type = "S0";
  public age = "Young";
  public redshift = "0";

  public constructor(parameters?: GalaxyParameters) {
    if (parameters) {
      this.magnitude = parameters.magnitude;
      this.type = parameters.type;
      this.age = parameters.age;
      this.redshift = parameters.redshift;
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
    };
  }
}

interface Props {
  galaxy: Galaxy;
  update: (spectrum: Spectrum) => void;
}

export default function GalaxyPanel({ galaxy, update }: Props) {
  const { magnitude, type, age, redshift } = galaxy;
  const errors = galaxy.errors;

  const updateParameter = (parameter: string, newValue: string) => {
    const updatedParameters = {
      magnitude,
      type,
      age,
      redshift,
      [parameter]: newValue,
    };
    update(new Galaxy(updatedParameters));
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
            value={magnitude}
            onChange={(event) =>
              updateParameter("magnitude", event.target.value)
            }
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
            value={type}
            onChange={(event) => updateParameter("type", event.target.value)}
          >
            {GALAXY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
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
            value={age}
            onChange={(event) => updateParameter("age", event.target.value)}
          >
            {GALAXY_AGES.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
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
