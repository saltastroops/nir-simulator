import { Spectrum } from "../../types";
import Galaxy, { GALAXY_AGES, GALAXY_TYPES } from "../../spectrum/Galaxy";

let idCounter = 0;

interface Props {
  galaxy: Galaxy;
  update: (spectrum: Spectrum) => void;
}

export default function GalaxyPanel({ galaxy, update }: Props) {
  const parameters = galaxy.parameters;
  const errors = galaxy.errors();

  const updateParameter = (parameter: string, newValue: string) => {
    const updatedParameters = {
      ...parameters,
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
            value={parameters.magnitude}
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
            value={parameters.type}
            onChange={(event) => updateParameter("type", event.target.value)}
          >
            {GALAXY_TYPES.map((type) => (
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
            onChange={(event) => updateParameter("age", event.target.value)}
          >
            {GALAXY_AGES.map((age) => (
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
