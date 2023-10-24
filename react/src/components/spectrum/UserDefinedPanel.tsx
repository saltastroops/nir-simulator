import { Spectrum } from "../../types";
import Errors from "../Errors.tsx";

let idCounter = 0;

interface UserDefinedParameters {
  file: File | null;
}

export class UserDefined implements Spectrum {
  public readonly spectrumType = "User-Defined";
  public file: File | null = null;

  public constructor(parameters?: UserDefinedParameters) {
    if (parameters) {
      this.file = parameters.file;
    }
  }

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // file
    if (!data.file) {
      errors.file = "You need to choose a file.";
    }

    return errors;
  }

  public get data() {
    return {
      file: this.file,
    };
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  userDefined: UserDefined;
  update: (spectrum: Spectrum) => void;
}

export default function UserDefinedPanel({ userDefined, update }: Props) {
  const { errors } = userDefined;
  const updateFile = (files: FileList | null) => {
    let newFile: File | null = null;
    if (files !== null && files.length > 0) {
      newFile = files[0];
    }
    const updatedParameters = {
      file: newFile,
    };
    update(new UserDefined(updatedParameters));
  };

  idCounter++;

  return (
    <div>
      {/* file */}
      <div className="flex items-center">
        <input
          type="file"
          className="block w-full text-sm text-slate-500
        file:mr-6 file:py-1 file:px-2
        file:rounded-md file:border-0
        file:font-semibold
        file:bg-green-600 file:text-white
        hover:file:bg-green-700"
          onChange={(event) => updateFile(event.target.files)}
        />
      </div>

      {/* errors */}
      {userDefined.hasErrors && <Errors errors={errors} keys={["file"]} />}
    </div>
  );
}
