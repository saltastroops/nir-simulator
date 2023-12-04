import { InstrumentMode } from "../../types.ts";
import { select } from "../utils.ts";

interface SpectroscopyConfigurationParameters {
  slitType: string;
  slitWidth: string;
  grating: string;
  gratingAngle: string;
}

export class SpectroscopyConfiguration {
  public readonly mode: InstrumentMode = "Spectroscopy";
  public slitType = "Longslit";
  public slitWidth = "1.5";
  public grating = "950";
  public gratingAngle = "40";

  public constructor(parameters?: SpectroscopyConfigurationParameters) {
    if (parameters) {
      this.slitType = parameters.slitType;
      this.slitWidth = parameters.slitWidth;
      this.grating = parameters.grating;
      this.gratingAngle = parameters.gratingAngle;
    }
  }

  public get data() {
    return {
      mode: this.mode,
      slitType: this.slitType,
      slitWidth: parseFloat(this.slitWidth),
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
  const { slitType, slitWidth, grating, gratingAngle } =
    spectroscopyConfiguration;

  const updateParameter = (parameter: string, newValue: string) => {
    const newSpectroscopyConfiguration = new SpectroscopyConfiguration({
      ...spectroscopyConfiguration,
      [parameter]: newValue,
    });
    update(newSpectroscopyConfiguration);
  };

  return (
    <div className="mt-2">
      <fieldset className="border border-solid border-gray-300 p-3">
        <legend>Spectroscopy</legend>
        <div className="field">
          <div className="control">
            <label className="label">Slit Type</label>
            <div>
              <select
                className={select("w-32")}
                value={slitType}
                onChange={(event) =>
                  updateParameter("slitType", event.target.value)
                }
                name="slitType"
              >
                <option value="longslit">Longslit</option>
              </select>
            </div>
          </div>
          <div className="control">
            <label className="label">Slit Width</label>
            <div>
              <select
                className={select("w-32")}
                value={slitWidth}
                onChange={(event) =>
                  updateParameter("slitWidth", event.target.value)
                }
                name="slitWidth"
              >
                <option value="0.6">0.6</option>
                <option value="1.0">1.0</option>
                <option value="1.25">1.25</option>
                <option value="1.5">1.5</option>
                <option value="2.0">2.0</option>
                <option value="3.0">3.0</option>
                <option value="4.0">4.0</option>
              </select>
            </div>
          </div>
          <div className="control">
            <label className="label">Grating</label>
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
          <div className="control">
            <label className="label">Grating Angle</label>
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
      </fieldset>
    </div>
  );
}
