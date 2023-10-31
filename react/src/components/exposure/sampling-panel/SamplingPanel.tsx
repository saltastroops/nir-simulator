import { ExposureConfiguration } from "../ExposurePanel.tsx";
import { Error } from "../../Error.tsx";

type SamplingType = "Fowler Sampling" | "Up The Ramp Sampling";
interface SamplingParameters {
  numberOfSamples: string;
  samplingType: SamplingType;
}

export class Sampling {
  public numberOfSamples = "15";
  public samplingType: SamplingType = "Fowler Sampling";

  public constructor(sampling?: SamplingParameters) {
    if (sampling) {
      this.numberOfSamples = sampling.numberOfSamples;
      this.samplingType = sampling.samplingType;
    }
  }
  public get data() {
    return {
      numberOfSamples: parseInt(this.numberOfSamples),
      samplingType: this.samplingType,
    };
  }

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // Number of samples
    const numberOfSamples = data.numberOfSamples;
    const minNumberOfSamples = 1;
    if (
      Number.isNaN(numberOfSamples) ||
      numberOfSamples < minNumberOfSamples ||
      !Number.isInteger(numberOfSamples)
    ) {
      errors.numberOfSamples = `Must be a positive integer.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  setupData: ExposureConfiguration;
  update: (setupData: ExposureConfiguration) => void;
}
export function SamplingPanel({ setupData, update }: Props) {
  const updateSamplesNumber = (value: string) => {
    updateSamplingSetup("numberOfSamples", value);
  };
  const updateSamplingSetup = (
    key: "numberOfSamples" | "samplingType",
    value: string,
  ) => {
    update(
      new ExposureConfiguration({
        ...setupData,
        sampling: new Sampling({
          ...setupData.sampling,
          [key]: value,
        }),
      }),
    );
  };
  return (
    <>
      <div className="columns">
        <div className="column pb-1">
          <div className="control">
            <label className="radio">
              <input
                className="mr-2"
                type="radio"
                name="sampling-type"
                value={"specified"}
                onChange={() =>
                  updateSamplingSetup("samplingType", "Fowler Sampling")
                }
                checked={setupData.sampling.samplingType === "Fowler Sampling"}
              />
              Fowler
            </label>
            <img src={"/images/Fowler.jpg"} alt="Logo" />
          </div>
        </div>
        <div className="column pb-1">
          <div className="control">
            <label className="radio">
              <input
                className="mr-2"
                type="radio"
                name="sampling-type"
                value={"specified"}
                onChange={() =>
                  updateSamplingSetup("samplingType", "Up The Ramp Sampling")
                }
                checked={
                  setupData.sampling.samplingType === "Up The Ramp Sampling"
                }
              />
              Up the Ramp
            </label>

            <img src={"/images/UpTheRamp.jpg"} alt="Logo" />
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="column pt-0 pb-0">
          <div className="field">
            <label className="label">Number of Samples</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name={"numberOfSamples"}
                value={setupData.sampling.numberOfSamples}
                onChange={(event) => updateSamplesNumber(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      {setupData.sampling.errors["numberOfSamples"] && (
        <div className="columns">
          <div className="column pt-0">
            <Error error={setupData.sampling.errors["numberOfSamples"]} />
          </div>
        </div>
      )}
    </>
  );
}
