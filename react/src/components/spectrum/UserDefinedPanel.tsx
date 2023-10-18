import { Spectrum } from "../../types";
import UserDefined from "../../spectrum/UserDefined.ts";

let idCounter = 0;

interface Props {
  userDefined: UserDefined;
  update: (spectrum: Spectrum) => void;
}

export default function UserDefinedPanel({ userDefined, update }: Props) {
  const parameters = userDefined.parameters;
  const updateFile = (files: FileList | null) => {
    let file: File | null = null;
    if (files !== null && files.length > 0) {
      file = files[0];
    }
    const updatedParameters = {
      ...parameters,
      file,
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
            {parameters.file && (
              <span className="file-name">{parameters.file.name}</span>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
