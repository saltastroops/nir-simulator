import { ExposureConfigurationType } from "../ExposurePanel.tsx";
import { SimulationSetupParameters } from "../../Simulator.tsx";
import { Error } from "../../Error.tsx";

export interface ExposureTimeType {
  exposureTime: string;
  detectorIterations: string;
}

export class SNRQuery {
  public exposureTime = "3600";
  public detectorIterations = "1";

  public constructor(solve?: ExposureTimeType) {
    if (solve) {
      this.exposureTime = solve.exposureTime;
      this.detectorIterations = solve.detectorIterations;
    }
  }
  public get data() {
    return {
      exposureTime: parseFloat(this.exposureTime),
      detectorIterations: parseInt(this.detectorIterations),
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
      errors.detectorIterations = `The detector iterations must be an integer greater than or equal to ${minDetectorIterations}.`;
    }

    // Exposure Time
    const exposureTime = data.exposureTime;
    const minExposureTime = 0;
    if (Number.isNaN(exposureTime) || exposureTime < minExposureTime) {
      errors.exposureTime = "exposure time must be a positive number.";
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  setup: SimulationSetupParameters;
  update: (exposureConfiguration: ExposureConfigurationType) => void;
}
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
      solveSNR: new SNRQuery({
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
              <div className="column">
                <Error
                  error={
                    setup.exposureConfiguration.solveSNR.errors["exposureTime"]
                  }
                />
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
              <div className="column">
                <Error
                  error={
                    setup.exposureConfiguration.solveSNR.errors[
                      "detectorIterations"
                    ]
                  }
                />
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
