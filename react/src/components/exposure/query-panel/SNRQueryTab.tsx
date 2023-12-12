import { Error } from "../../Error.tsx";
import { input } from "../../utils.ts";

interface ExposureTimeParameters {
  singleExposureTime: string;
  detectorIterations: string;
}

export interface ExposureTimeDataType {
  singleExposureTime: number;
  detectorIterations: number;
}

export class ExposureTime {
  public singleExposureTime = "3600";
  public detectorIterations = "1";

  public constructor(exposureTime?: ExposureTimeParameters) {
    if (exposureTime) {
      this.singleExposureTime = exposureTime.singleExposureTime;
      this.detectorIterations = exposureTime.detectorIterations;
    }
  }
  public get data(): ExposureTimeDataType {
    return {
      singleExposureTime: parseFloat(this.singleExposureTime),
      detectorIterations: parseInt(this.detectorIterations, 10),
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
    const exposureTime = data.singleExposureTime;
    if (Number.isNaN(exposureTime) || exposureTime < 0) {
      errors.singleExposureTime =
        "The exposure time must be a positive number.";
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  exposureTime: ExposureTime;
  update: (key: "exposureTime" | "snr", exposureTime: ExposureTime) => void;
  updatePlots: () => void;
}
export function SNRQueryTab({ exposureTime, update, updatePlots }: Props) {
  const updateValue = (event: any) => {
    updateExposureTime(event.target.name, event.target.value);
  };

  const updateExposureTime = (
    key: "singleExposureTime" | "detectorIterations",
    value: string,
  ) => {
    update(
      "exposureTime",
      new ExposureTime({
        ...exposureTime,
        [key]: value,
      }),
    );
  };

  // const updatePlot = () => {
  //   console.log("Update plot method not implement"); // TODO update should come from ExposurePanel
  // };

  return (
    <>
      <div className="field">
        <label>Exposure Time</label>
        <div className="control">
          <input
            className={input("w-52")}
            type="text"
            name={"singleExposureTime"}
            value={exposureTime.singleExposureTime}
            onChange={updateValue}
          />
          {exposureTime.errors["singleExposureTime"] && (
            <div className="columns">
              <div className="column">
                <Error error={exposureTime.errors["singleExposureTime"]} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="field">
        <label>Detector Iterations</label>
        <div className="control">
          <input
            className={input("w-52")}
            type="text"
            name={"detectorIterations"}
            value={exposureTime.detectorIterations}
            onChange={updateValue}
          />
          {exposureTime.errors["detectorIterations"] && (
            <div className="columns">
              <div className="column">
                <Error error={exposureTime.errors["detectorIterations"]} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="field ">
        <div className="control">
          <button className="button is-link" onClick={updatePlots}>
            Solve for Signal to Noise
          </button>
        </div>
      </div>
    </>
  );
}
