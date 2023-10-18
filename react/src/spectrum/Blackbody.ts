import { Spectrum } from "../types.ts";

interface BlackbodyParameters {
  magnitude: string;
  temperature: string;
}

export default class Blackbody implements Spectrum {
  public readonly type = "Blackbody";
  public parameters = {
    magnitude: "18",
    temperature: "5000",
  };

  public constructor(parameters?: BlackbodyParameters) {
    if (parameters) {
      this.parameters = parameters;
    }
  }

  public errors = () => {
    const errors: Record<string, string> = {};
    const parameters = this.typedParameters();

    // magnitude
    const magnitude = parameters.magnitude;
    if (Number.isNaN(magnitude)) {
      errors.magnitude = "The magnitude must be a number.";
    }

    // temperature
    const temperature = parameters.temperature;
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
  };

  public typedParameters = (): Record<string, any> => ({
    magnitude: parseFloat(this.parameters.magnitude),
    temperature: parseFloat(this.parameters.temperature),
  });
}
