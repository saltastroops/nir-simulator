import { Spectrum } from "../../types";

let idCounter = 0;

export interface BlackbodySpectrum extends Spectrum {
  type: "Blackbody";
  parameters: {
    magnitude: string;
    temperature: string;
  };
}

interface Props {
  blackbody: BlackbodySpectrum;
  update: (spectrum: Spectrum) => void;
}

export function makeDefaultBlackbody(): BlackbodySpectrum {
  return {
    type: "Blackbody",
    parameters: {
      magnitude: "20",
      temperature: "5000",
    },
    errors: {},
  };
}

export default function Blackbody({ blackbody, update }: Props) {
  const { parameters, errors } = blackbody;
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
      type: "Blackbody",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  const updateTemperature = (value: string) => {
    const errorMessage = "The temperature must be a positive number.";
    let error: string = undefined;
    const temperature = parseFloat(value);
    if (isNaN(temperature) || temperature <= 0) {
      error = errorMessage;
    }
    const updatedErrors = {
      ...errors,
      temperature: error,
    };
    const updatedParameters = {
      ...parameters,
      temperature: value,
    };
    update({
      type: "Blackbody",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
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
            onChange={(event) => updateMagnitude(event.target.value)}
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
            onChange={(event) => updateTemperature(event.target.value)}
          />
        </div>
        {errors.temperature && (
          <div className="text-red-700">{errors.temperature}</div>
        )}
      </div>
    </div>
  );
}
