import { SimulationSetupParameters } from "../../Simulator.tsx";
import { ExposureConfigurationType } from "../ExposurePanel.tsx";
import { Error } from "../../Error.tsx";

export interface SNRType {
  snr: string;
  wavelength: string;
}

export class ExposureTimeQuery {
  public snr = "10";
  public wavelength = "13000";

  public constructor(solve?: SNRType) {
    if (solve) {
      this.snr = solve.snr;
      this.wavelength = solve.wavelength;
    }
  }
  public get data() {
    return {
      snr: parseFloat(this.snr),
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
    const snr = data.snr;
    const minSnr = 1;
    if (Number.isNaN(snr) || snr < minSnr || !Number.isInteger(snr)) {
      errors.snr = `The requested signal to noise must be a positive integer greater than or equal to ${minSnr}.`;
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

export function SolveForExposureTime({ setup, update }: Props) {
  const updatePlot = () => {
    console.log("Update plot method not implement");
  };

  const updateSNR = (key: "wavelength" | "snr", value: string) => {
    update({
      ...setup.exposureConfiguration,
      solveExposureTime: new ExposureTimeQuery({
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
            name={"snr"}
            value={setup.exposureConfiguration.solveExposureTime.snr}
            onChange={(event) => updateSNR("snr", event.target.value)}
          />
          {setup.exposureConfiguration.solveExposureTime.errors["snr"] && (
            <Error
              error={
                setup.exposureConfiguration.solveExposureTime.errors["snr"]
              }
            />
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
            onChange={(event) => updateSNR("wavelength", event.target.value)}
          />
        </div>
        <div className="control">
          <span className="mr-3">Quick Select:</span>
          <span
            className="text-sky-500 cursor-pointer"
            onClick={() => updateSNR("wavelength", "13000")}
          >
            Central Wavelength
          </span>
          {setup.exposureConfiguration.solveExposureTime.errors[
            "wavelength"
          ] && (
            <Error
              error={
                setup.exposureConfiguration.solveExposureTime.errors[
                  "wavelength"
                ]
              }
            />
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
