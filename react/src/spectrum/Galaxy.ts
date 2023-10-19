import { Spectrum } from "../types.ts";

export const GALAXY_TYPES = ["E", "S0", "Sa", "Sb", "Sc", "Sd"];

export const GALAXY_AGES = ["Young", "Old"];

interface GalaxyParameters {
  magnitude: string;
  type: string;
  age: string;
  redshift: string;
}

export default class Galaxy implements Spectrum {
  public readonly type = "Galaxy";
  public parameters = {
    magnitude: "18",
    type: "S0",
    age: "Young",
    redshift: "0",
  };

  public constructor(parameters?: GalaxyParameters) {
    if (parameters) {
      this.parameters = parameters;
    }
    this.data = this.data.bind(this);
    this.errors = this.errors.bind(this);
  }

  public errors() {
    const errors: Record<string, string> = {};
    const data = this.data();

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

  public data() {
    return {
      magnitude: parseFloat(this.parameters.magnitude),
      type: this.parameters.type,
      age: this.parameters.age,
      redshift: parseFloat(this.parameters.redshift),
    };
  }
}
