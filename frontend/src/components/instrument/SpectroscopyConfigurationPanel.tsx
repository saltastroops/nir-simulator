import { InstrumentMode } from "../../types.ts";
import { select } from "../utils.ts";

interface SpectroscopyConfigurationParameters {
  grating: string;
  gratingAngle: string;
}

export class SpectroscopyConfiguration {
  public readonly mode: InstrumentMode = "Spectroscopy";
  public grating = "950";
  public gratingAngle = "40";

  public constructor(parameters?: SpectroscopyConfigurationParameters) {
    if (parameters) {
      this.grating = parameters.grating;
      this.gratingAngle = parameters.gratingAngle;
    }
  }

  public get data() {
    return {
      mode: this.mode,
      grating: this.grating,
      gratingAngle: parseFloat(this.gratingAngle),
    };
  }
}

interface Props {
  spectroscopyConfiguration: SpectroscopyConfiguration;
  update: (spectroscopyConfiguration: SpectroscopyConfiguration) => void;
}

export default function SpectroscopyConfigurationPanel({
  spectroscopyConfiguration,
  update,
}: Props) {
  const { grating, gratingAngle } = spectroscopyConfiguration;

  const updateParameter = (parameter: string, newValue: string) => {
    const newSpectroscopyConfiguration = new SpectroscopyConfiguration({
      ...spectroscopyConfiguration,
      [parameter]: newValue,
    });
    update(newSpectroscopyConfiguration);
  };

  return (
    <div>
      <div className="field">
        <div className="control pb-2">
          <label>Grating (lines per mm)</label>
          <div>
            <select
              className={select("w-32")}
              value={grating}
              onChange={(event) =>
                updateParameter("grating", event.target.value)
              }
              name="grating"
            >
              <option value="950">950</option>
            </select>
          </div>
        </div>
        <div className="control pb-2">
          <label>Grating Angle (degrees)</label>
          <div>
            <select
              className={select("w-32")}
              value={gratingAngle}
              onChange={(event) =>
                updateParameter("gratingAngle", event.target.value)
              }
              name="gratingAngle"
            >
              <option value="30">30</option>
              <option value="35">35</option>
              <option value="40">40</option>
              <option value="45">45</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
