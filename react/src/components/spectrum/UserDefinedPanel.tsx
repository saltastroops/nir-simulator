import { Spectrum } from "../../types";

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
}

interface Props {
  userDefined: UserDefined;
  update: (spectrum: Spectrum) => void;
}

export default function UserDefinedPanel({ userDefined, update }: Props) {
  const { file } = userDefined;
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
    <div className="flex flex-wrap items-top p-3">
      {/* file */}
      <div>
        <div>
          <label htmlFor={`file-${idCounter}`}>Data File</label>
        </div>
        <div className="file has-name">
          <label className="file-label">
            <input
              type="file"
              className="file-input"
              onChange={(event) => updateFile(event.target.files)}
            />
            <span className="file-cta">
              <span className="file-label">Choose a file...</span>
            </span>
            {file && <span className="file-name">{file.name}</span>}
          </label>
        </div>
      </div>
    </div>
  );
}
