import { Spectrum } from "../../types";

let idCounter = 0;

interface BlackbodyParameters {
  magnitude: string;
  temperature: string;
}

export class Blackbody implements Spectrum {
  public readonly spectrumType = "Blackbody";
  public magnitude = "18";
  public temperature = "5000";

  public constructor(parameters?: BlackbodyParameters) {
    if (parameters) {
      this.magnitude = parameters.magnitude;
      this.temperature = parameters.temperature;
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

    // temperature
    const temperature = data.temperature;
    const minTemperature = 30;
    const maxTemperature = 100000;
    if (
      isNaN(temperature) ||
      temperature < minTemperature ||
      temperature > maxTemperature
    ) {
      errors.temperature = `The temperature must be a number between ${minTemperature} and ${maxTemperature}.`;
    }

    return errors;
  }

  public get data() {
    return {
      magnitude: parseFloat(this.magnitude),
      temperature: parseFloat(this.temperature),
    };
  }
}

interface Props {
  blackbody: Blackbody;
  update: (spectrum: Spectrum) => void;
}

export default function BlackbodyPanel({ blackbody, update }: Props) {
  const { magnitude, temperature } = blackbody;
  const errors = blackbody.errors;

  const updateParameter = (parameter: string, newValue: string) => {
    const updatedParameters = {
      magnitude,
      temperature,
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
            value={temperature}
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
