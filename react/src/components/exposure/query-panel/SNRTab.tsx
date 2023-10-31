import { Error } from "../../Error.tsx";

interface ExposureTimeParameters {
  singleExposureTime: string;
  detectorIterations: string;
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
  public get data() {
    return {
      singleExposureTime: parseFloat(this.singleExposureTime),
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
    const exposureTime = data.singleExposureTime;
    const minExposureTime = 0;
    if (Number.isNaN(exposureTime) || exposureTime < minExposureTime) {
      errors.singleExposureTime = "Exposure time must be a positive number.";
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  setupData: ExposureTime;
  update: (key: "exposureTime" | "snr", exposureTime: ExposureTime) => void;
}
export function SNRTab({ setupData, update }: Props) {
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
        ...setupData,
        [key]: value,
      }),
    );
  };

  const updatePlot = () => {
    console.log("Update plot method not implement"); // TODO update should come from ExposurePanel
  };

  return (
    <>
      <div className="field">
        <label className="label">Exposure Time</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"singleExposureTime"}
            value={setupData.singleExposureTime}
            onChange={updateValue}
          />
          {setupData.errors["singleExposureTime"] && (
            <div className="columns">
              <div className="column">
                <Error error={setupData.errors["singleExposureTime"]} />
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
            value={setupData.detectorIterations}
            onChange={updateValue}
          />
          {setupData.errors["detectorIterations"] && (
            <div className="columns">
              <div className="column">
                <Error error={setupData.errors["detectorIterations"]} />
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
