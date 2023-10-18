import { Spectrum } from "../types.ts";

interface UserDefinedParameters {
  file: File | null;
}

export default class UserDefined implements Spectrum {
  public readonly type = "User-Defined";
  public parameters: Record<string, File | null> = {
    file: null,
  };

  public constructor(parameters?: UserDefinedParameters) {
    if (parameters) {
      this.parameters = { ...parameters }; // make TypeScript happy
    }
  }

  public errors = () => {
    const errors: Record<string, string> = {};
    const parameters = this.typedParameters();

    // file
    if (!parameters.file) {
      errors.file = "You need to choose a file.";
    }

    return errors;
  };

  public typedParameters = () => ({
    file: this.parameters.file,
  });
}
