import { ExposureConfiguration } from "../ExposurePanel.tsx";
import { Error } from "../../Error.tsx";
import { input } from "../../utils.ts";

type SamplingType = "Fowler" | "Up The Ramp";
interface SamplingParameters {
  numberOfSamples: string;
  samplingType: SamplingType;
}

export interface SamplingDataType {
  numberOfSamples: number;
  samplingType: SamplingType;
}

export class Sampling {
  public numberOfSamples = "15";
  public samplingType: SamplingType = "Fowler";

  public constructor(sampling?: SamplingParameters) {
    if (sampling) {
      this.numberOfSamples = sampling.numberOfSamples;
      this.samplingType = sampling.samplingType;
    }
  }
  public get data(): SamplingDataType {
    return {
      numberOfSamples: parseInt(this.numberOfSamples, 10),
      samplingType: this.samplingType,
    };
  }

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // Number of samples
    const numberOfSamples = data.numberOfSamples;
    if (
      Number.isNaN(numberOfSamples) ||
      numberOfSamples < 1 ||
      !Number.isInteger(numberOfSamples)
    ) {
      errors.numberOfSamples = `The number of samples must be a positive integer.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  exposureConfiguration: ExposureConfiguration;
  update: (setupData: ExposureConfiguration) => void;
}
export function SamplingPanel({ exposureConfiguration, update }: Props) {
  const updateSamplesNumber = (value: string) => {
    updateSamplingSetup("numberOfSamples", value);
  };
  const updateSamplingSetup = (
    key: "numberOfSamples" | "samplingType",
    value: string,
  ) => {
    update(
      new ExposureConfiguration({
        ...exposureConfiguration,
        sampling: new Sampling({
          ...exposureConfiguration.sampling,
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
                onChange={() => updateSamplingSetup("samplingType", "Fowler")}
                checked={
                  exposureConfiguration.sampling.samplingType === "Fowler"
                }
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
                  updateSamplingSetup("samplingType", "Up The Ramp")
                }
                checked={
                  exposureConfiguration.sampling.samplingType === "Up The Ramp"
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
                className={input("w-36")}
                type="text"
                name={"numberOfSamples"}
                value={exposureConfiguration.sampling.numberOfSamples}
                onChange={(event) => updateSamplesNumber(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      {exposureConfiguration.sampling.errors["numberOfSamples"] && (
        <div className="columns">
          <div className="column pt-0">
            <Error
              error={exposureConfiguration.sampling.errors["numberOfSamples"]}
            />
          </div>
        </div>
      )}
    </>
  );
}
