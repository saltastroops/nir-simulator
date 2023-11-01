import { GainSelector } from "./GainSelector.tsx";
import { NonEditableGainPanel } from "./NonEditableGainPanel.tsx";
import { CustomGainPanel } from "./CustomGainPanel.tsx";
import { ExposureConfiguration } from "../ExposurePanel.tsx";

export type GainType = "Faint" | "Bright" | "Custom";

export interface GainParameters {
  gainType: GainType;
  adu: string;
  readNoise: string;
  fullWell: string;
}

export interface GainDataType {
  adu: number;
  readNoise: number;
  fullWell: number;
}
export class Gain {
  public gainType: GainType = "Faint";
  public adu = "2.04";
  public readNoise = "17";
  public fullWell = "60000";

  public constructor(gains?: GainParameters) {
    if (gains) {
      this.gainType = gains.gainType;
      this.adu = gains.adu;
      this.readNoise = gains.readNoise;
      this.fullWell = gains.fullWell;
    }
  }

  public get data(): GainDataType {
    return {
      adu: parseInt(this.adu, 10),
      readNoise: parseFloat(this.readNoise),
      fullWell: parseInt(this.fullWell, 10),
    };
  }

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    const adu = data.adu;
    const minAdu = 1;

    if (Number.isNaN(adu) || !Number.isInteger(adu) || adu < minAdu) {
      errors.adu = `The ADU must be an integer greater than or equal to ${minAdu}.`;
    }

    // Read Noise
    const readNoise = data.readNoise;
    const minReadNoise = 1;
    if (Number.isNaN(readNoise) || readNoise < minReadNoise) {
      errors.readNoise = `The read noise must be a positive number greater than or equal to ${minReadNoise}.`;
    }

    // Full well
    const fullWell = data.fullWell;
    const minFullWell = 1;
    if (
      Number.isNaN(fullWell) ||
      !Number.isInteger(fullWell) ||
      fullWell < minFullWell
    ) {
      errors.fullWell = `The full well must be an integer greater than or equal to ${minFullWell}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  exposureConfiguration: ExposureConfiguration;
  update: (gains: ExposureConfiguration) => void;
}

export function GainPanel({ exposureConfiguration, update }: Props) {
  const updateGain = (newGain: Gain) => {
    update(
      new ExposureConfiguration({
        ...exposureConfiguration,
        gain: newGain,
      }),
    );
  };
  return (
    <>
      <div className="columns">
        <div className="column pr-0 is-two-fifths">
          <GainSelector
            updateGain={updateGain}
            gain={exposureConfiguration.gain}
          />
        </div>
        <div className="column pl-0">
          {(exposureConfiguration.gain.gainType === "Bright" ||
            exposureConfiguration.gain.gainType === "Faint") && (
            <NonEditableGainPanel gain={exposureConfiguration.gain} />
          )}
          {exposureConfiguration.gain.gainType === "Custom" && (
            <CustomGainPanel
              update={updateGain}
              gain={exposureConfiguration.gain}
            />
          )}
        </div>
      </div>
    </>
  );
}
