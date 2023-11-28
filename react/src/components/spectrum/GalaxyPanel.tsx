import { Spectrum } from "../../types";
import Errors from "../Errors.tsx";
import { input, label, select } from "../utils.ts";

let idCounter = 0;

export const GALAXY_TYPES = ["E", "S0", "Sa", "Sb", "Sc", "Sd"];

export const GALAXY_AGES = ["Young", "Old"];

interface GalaxyParameters {
  magnitude: string;
  type: string;
  age: string;
  redshift: string;
  hasEmissionLines: boolean;

}

export class Galaxy implements Spectrum {
  public readonly spectrumType = "Galaxy";
  public magnitude = "18";
  public type = "S0";
  public age = "Young";
  public redshift = "0";
  public hasEmissionLines = true;

  public constructor(parameters?: GalaxyParameters) {
    if (parameters) {
      this.magnitude = parameters.magnitude;
      this.type = parameters.type;
      this.age = parameters.age;
      this.redshift = parameters.redshift;
      this.hasEmissionLines = parameters.hasEmissionLines
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
      hasEmissionLines: this.hasEmissionLines,
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
  const { magnitude, type, age, redshift, hasEmissionLines, errors } = galaxy;

  const updateParameter = (parameter: string, newValue: string | boolean) => {
    const updatedParameters = {
      magnitude,
      type,
      age,
      redshift,
      hasEmissionLines,
      [parameter]: newValue,
    };
    update(new Galaxy(updatedParameters));
  };

  idCounter++;
  const magnitudeId = `centralWavelength-${idCounter}`;
  const typeId = `fwhm-${idCounter}`;
  const ageId = `flux-${idCounter}`;
  const redshiftId = `redshift-${idCounter}`;
  const hasEmissionLinesId = `hasEmissionLines-${idCounter}`;

  return (
    <div>
      <div className="flex items-center">
        {/* magnitude */}
        <label htmlFor={magnitudeId} className={label("mr-2")}>
          Apparent Magnitude
        </label>
        <input
          id={magnitudeId}
          className={input("w-12")}
          type="text"
          value={magnitude}
          onChange={(event) => updateParameter("magnitude", event.target.value)}
        />

        {/* galaxy type */}
        <label htmlFor={typeId} className={label("ml-5 mr-2")}>
          Type
        </label>
        <select
          id={typeId}
          value={type}
          className={select("w-16")}
          onChange={(event) => updateParameter("type", event.target.value)}
        >
          {GALAXY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* age */}
        <label htmlFor={ageId} className={label("ml-5 mr-2")}>
          Age
        </label>
        <select
          id={ageId}
          value={age}
          className={select("w-24")}
          onChange={(event) => updateParameter("age", event.target.value)}
        >
          {GALAXY_AGES.map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>

        {/* Redshift */}
        <label htmlFor={redshiftId} className="ml-4 mr-2">
          Redshift
        </label>
        <input
          id={redshiftId}
          className={input("w-12")}
          type="text"
          value={redshift}
          onChange={(event) => updateParameter("redshift", event.target.value)}
        />
      </div>

      {/* Has emission lines? */}
      <div>
        <label htmlFor={hasEmissionLinesId} className="pt-6">
          <input
              id={hasEmissionLinesId}
              type="checkbox"
              checked={hasEmissionLines}
              onChange={(event) =>
                  updateParameter("hasEmissionLines", event.target.checked)
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
