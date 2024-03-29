import { ExposureConfiguration } from "../ExposureTab.tsx";
import { Error } from "../../Error.tsx";
import { input } from "../../utils.ts";

type SamplingMode = "Fowler" | "Up The Ramp";
interface SamplingParameters {
  numberOfSamples: string;
  samplingMode: SamplingMode;
}

export interface SamplingDataType {
  numberOfSamples: number;
  samplingMode: SamplingMode;
}

export class Sampling {
  public numberOfSamples = "15";
  public samplingMode: SamplingMode = "Fowler";

  public constructor(sampling?: SamplingParameters) {
    if (sampling) {
      this.numberOfSamples = sampling.numberOfSamples;
      this.samplingMode = sampling.samplingMode;
    }
  }
  public get data(): SamplingDataType {
    return {
      numberOfSamples: parseInt(this.numberOfSamples, 10),
      samplingMode: this.samplingMode,
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
    key: "numberOfSamples" | "samplingMode",
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
    <div>
      <div className="flex">
        <div className="ml-2 p-1">
          <div className="control">
            <label className="radio">
              <input
                className="mr-2"
                type="radio"
                name="sampling-mode"
                value={"specified"}
                onChange={() => updateSamplingSetup("samplingMode", "Fowler")}
                checked={
                  exposureConfiguration.sampling.samplingMode === "Fowler"
                }
              />
              Fowler
            </label>
            <img src={"/images/Fowler.jpg"} alt="Logo" />
          </div>
        </div>
        <div className="ml-2 p-1">
          <div className="control">
            <label className="radio">
              <input
                className="mr-2"
                type="radio"
                name="sampling-mode"
                value={"specified"}
                onChange={() =>
                  updateSamplingSetup("samplingMode", "Up The Ramp")
                }
                checked={
                  exposureConfiguration.sampling.samplingMode === "Up The Ramp"
                }
              />
              Up the Ramp
            </label>

            <img src={"/images/UpTheRamp.jpg"} alt="Logo" />
          </div>
        </div>
      </div>
      <div className="ml-2 p-1">
        <div className="field">
          <label>Number of Samples</label>
          <div className="control pb-2">
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

      {exposureConfiguration.sampling.errors["numberOfSamples"] && (
        <div>
          <div className="ml-2">
            <Error
              error={exposureConfiguration.sampling.errors["numberOfSamples"]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
