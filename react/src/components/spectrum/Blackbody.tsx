import { Spectrum } from "../../types";
import { ChangeEvent } from "react";

export interface BlackbodySpectrum extends Spectrum {
  type: "Blackbody";
  parameters: {
    magnitude: number;
    temperature: number;
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
      magnitude: 20,
      temperature: 5000,
    },
    errors: {},
  };
}

export default function Blackbody({ blackbody, update }: Props) {
  const updateMagnitude = (value: any) => {
    let error: string = undefined;
    const magnitude = parseFloat(value);
    if (isNaN(magnitude)) {
      error = "The magnitude must be a number.";
    }
    const updatedErrors = {
      ...blackbody.errors,
      magnitude: error,
    };
    const updatedParameters = {
      ...blackbody.parameters,
      magnitude,
    };
    update({
      type: "Blackbody",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  const updateTemperature = (value: any) => {
    const errorMessage = "The temperature must be a positive number.";
    let error: string = undefined;
    const temperature = parseFloat(value);
    if (isNaN(temperature) || temperature <= 0) {
      error = errorMessage;
    }
    const updatedErrors = {
      ...blackbody.errors,
      temperature: error,
    };
    const updatedParameters = {
      ...blackbody.parameters,
      temperature: temperature,
    };
    update({
      type: "Blackbody",
      parameters: updatedParameters,
      errors: updatedErrors,
    });
  };

  return (
    <div className="flex flex-wrap items-top p-3">
      <div className="mr-5 w-48">
        <div>Apparent Magnitude</div>
        <div>
          <input
            className="input"
            type="number"
            value={blackbody.parameters.magnitude}
            min={0}
            max={30}
            onChange={(event) => updateMagnitude(event.target.value)}
          />
        </div>
        <div>ERROR</div>
      </div>
      <div className="w-48">
        <div>Temperature</div>
        <div>
          <input
            className="input"
            type="number"
            value={blackbody.parameters.temperature}
            min={1000}
            max={15000}
            onChange={(event) => updateTemperature(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
