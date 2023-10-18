import { Spectrum } from "../../types";
import Blackbody from "../../spectrum/Blackbody";

let idCounter = 0;

interface Props {
  blackbody: Blackbody;
  update: (spectrum: Spectrum) => void;
}

export default function BlackbodyPanel({ blackbody, update }: Props) {
  const parameters = blackbody.parameters;
  const errors = blackbody.errors();

  const updateParameter = (parameter: string, newValue: string) => {
    const updatedParameters = {
      ...parameters,
      [parameter]: newValue,
    };
    update(new Blackbody(updatedParameters));
  };

  idCounter++;
  const magnitudeId = `magnitude-${idCounter}`;
  const temperatureId = `temperature-${idCounter}`;

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

      {/* temperature */}
      <div className="w-48">
        <div>
          <label htmlFor={temperatureId}>Temperature</label>
        </div>
        <div>
          <input
            id={temperatureId}
            className="input"
            type="text"
            value={parameters.temperature}
            onChange={(event) =>
              updateParameter("temperature", event.target.value)
            }
          />
        </div>
        {errors.temperature && (
          <div className="text-red-700">{errors.temperature}</div>
        )}
      </div>
    </div>
  );
}
