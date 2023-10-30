import { ExposureConfigurationType } from "../ExposurePanel.tsx";
import { SimulationSetupParameters } from "../../Simulator.tsx";

export interface SolveSNRType {
  exposureTime: string;
  detectorIterations: string;
}

export class SolveSNR {
  public exposureTime = "3600";
  public detectorIterations = "1";

  public constructor(solve?: SolveSNRType) {
    if (solve) {
      this.exposureTime = solve.exposureTime;
      this.detectorIterations = solve.detectorIterations;
    }
  }
  public get data() {
    return {
      exposureTime: parseFloat(this.exposureTime),
      detectorIterations: parseFloat(this.detectorIterations),
    };
  }

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // Detector Iterations
    const detectorIterations = data.detectorIterations;
    const minDetectorIterations = 1;
    if (
      Number.isNaN(detectorIterations) ||
      detectorIterations < minDetectorIterations ||
      !Number.isInteger(detectorIterations)
    ) {
      errors.detectorIterations = `The detector iterations must be a positive integer greater than or equal to ${minDetectorIterations}.`;
    }

    // Exposure Time
    const exposureTime = data.exposureTime;
    const minExposureTime = 1;
    if (
      Number.isNaN(exposureTime) ||
      exposureTime < minExposureTime ||
      !Number.isInteger(exposureTime)
    ) {
      errors.exposureTime = `The detector iterations must be a positive integer greater than or equal to ${minExposureTime}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

type Props = {
  setup: SimulationSetupParameters;
  update: (newSetup: ExposureConfigurationType) => void;
};
export function SolveForSNR({ setup, update }: Props) {
  const updateValue = (event: any) => {
    updateSolveSNR(event.target.name, event.target.value);
  };

  const updateSolveSNR = (
    key: "exposureTime" | "detectorIterations",
    value: string,
  ) => {
    update({
      ...setup.exposureConfiguration,
      solveSNR: new SolveSNR({
        ...setup.exposureConfiguration.solveSNR,
        [key]: value,
      }),
    });
  };

  const updatePlot = () => {
    console.log("Update plot method not implement");
  };

  return (
    <>
      <div className="field">
        <label className="label">Exposure Time</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"exposureTime"}
            value={setup.exposureConfiguration.solveSNR.exposureTime}
            onChange={updateValue}
          />
          {setup.exposureConfiguration.solveSNR.errors["exposureTime"] && (
            <div className="columns">
              <div className="column text-red-700">
                {setup.exposureConfiguration.solveSNR.errors["exposureTime"]}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="field">
        <label className="label">Detector Iterations</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"detectorIterations"}
            value={setup.exposureConfiguration.solveSNR.detectorIterations}
            onChange={updateValue}
          />
          {setup.exposureConfiguration.solveSNR.errors[
            "detectorIterations"
          ] && (
            <div className="columns">
              <div className="column text-red-700">
                {
                  setup.exposureConfiguration.solveSNR.errors[
                    "detectorIterations"
                  ]
                }
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="field ">
        <div className="control">
          <button className="button is-link" onClick={updatePlot}>
            Solve for Signal to Noise
          </button>
        </div>
      </div>
    </>
  );
}
