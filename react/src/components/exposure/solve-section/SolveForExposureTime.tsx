import { SimulationSetupParameters } from "../../Simulator.tsx";
import { ExposureConfigurationType } from "../ExposurePanel.tsx";

export interface SolveExposureTimeType {
  requestedSNR: string;
  wavelength: string;
}

export class SolveExposureTime {
  public requestedSNR = "10";
  public wavelength = "13000";

  public constructor(solve?: SolveExposureTimeType) {
    if (solve) {
      this.requestedSNR = solve.requestedSNR;
      this.wavelength = solve.wavelength;
    }
  }
  public get data() {
    return {
      requestedSNR: parseFloat(this.requestedSNR),
      wavelength: parseFloat(this.wavelength),
    };
  }
  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // Detector Iterations
    const wavelength = data.wavelength;
    const minWavelength = 9000;
    const maxWavelength = 17000;
    if (
      Number.isNaN(wavelength) ||
      wavelength < minWavelength ||
      wavelength > maxWavelength
    ) {
      errors.wavelength = `The wavelength must be a number between ${minWavelength} and ${maxWavelength}.`;
    }

    // Exposure Time
    const requestedSNR = data.requestedSNR;
    const minRequestedSNR = 1;
    if (
      Number.isNaN(requestedSNR) ||
      requestedSNR < minRequestedSNR ||
      !Number.isInteger(requestedSNR)
    ) {
      errors.requestedSNR = `The requested signal to noise must be a positive integer greater than or equal to ${minRequestedSNR}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

type Props = {
  setup: SimulationSetupParameters;
  update: (newData: ExposureConfigurationType) => void;
};

export function SolveForExposureTime({ setup, update }: Props) {
  const updatePlot = () => {
    console.log("Update plot method not implement");
  };

  const updateSolveET = (key: "wavelength" | "requestedSNR", value: string) => {
    update({
      ...setup.exposureConfiguration,
      solveExposureTime: new SolveExposureTime({
        ...setup.exposureConfiguration.solveExposureTime,
        [key]: value,
      }),
    });
  };

  return (
    <>
      <div className="field">
        <label className="label">Requested SNR</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"requestedSNR"}
            value={setup.exposureConfiguration.solveExposureTime.requestedSNR}
            onChange={(event) =>
              updateSolveET("requestedSNR", event.target.value)
            }
          />
          {setup.exposureConfiguration.solveExposureTime.errors[
            "requestedSNR"
          ] && (
            <div className="text-red-700">
              {
                setup.exposureConfiguration.solveExposureTime.errors[
                  "requestedSNR"
                ]
              }
            </div>
          )}
        </div>
      </div>
      <div className="field">
        <label className="label">SNR Requested at Which Wavelength?</label>
      </div>

      <div className="field">
        <label className="label">Wavelength</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"wavelength"}
            value={setup.exposureConfiguration.solveExposureTime.wavelength}
            onChange={(event) =>
              updateSolveET("wavelength", event.target.value)
            }
          />
        </div>
        <div className="control">
          <span className="mr-3">Quick Select:</span>
          <span
            className="text-sky-500 cursor-pointer"
            onClick={() => updateSolveET("wavelength", "13000")}
          >
            Central Wavelength
          </span>
          {setup.exposureConfiguration.solveExposureTime.errors[
            "wavelength"
          ] && (
            <div className="text-red-700">
              {
                setup.exposureConfiguration.solveExposureTime.errors[
                  "wavelength"
                ]
              }
            </div>
          )}
        </div>
      </div>

      <div className="field ">
        <div className="control">
          <button className="button is-link" onClick={() => updatePlot()}>
            Solve for Exposure Time
          </button>
        </div>
      </div>
    </>
  );
}
