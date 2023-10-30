import { GainTypeSelector } from "./GainTypeSelector.tsx";
import { NonEditableGainPanel } from "./NonEditableGainPanel.tsx";
import { CustomObject } from "./CustomObject.tsx";
import { ExposureConfigurationType } from "../ExposurePanel.tsx";

export type GainType = {
  gainType: "Faint Object" | "Bright Object" | "Custom Object";
  adu: string;
  readNoise: string;
  fullWell: string;
};
export class Gain {
  public gainType: "Faint Object" | "Bright Object" | "Custom Object" =
    "Faint Object";
  public adu = "2.04";
  public readNoise = "17";
  public fullWell = "60000";

  public constructor(gains?: GainType) {
    if (gains) {
      this.gainType = gains.gainType;
      this.adu = gains.adu;
      this.readNoise = gains.readNoise;
      this.fullWell = gains.fullWell;
    }
  }

  public get data() {
    return {
      adu: parseFloat(this.adu),
      readNoise: parseFloat(this.readNoise),
      fullWell: parseFloat(this.fullWell),
    };
  }

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    const adu = data.adu;
    const minAdu = 1;

    if (Number.isNaN(adu) || !Number.isInteger(adu) || adu < minAdu) {
      errors.adu = `The electron/ADU must be a positive integer greater than or equal to ${minAdu}.`;
    }

    // Read Noise
    const readNoise = data.readNoise;
    const minReadNoise = 1;
    if (
      Number.isNaN(readNoise) ||
      !Number.isInteger(readNoise) ||
      readNoise < minReadNoise
    ) {
      errors.readNoise = `The read noise must be a positive integer greater than or equal to ${minReadNoise}.`;
    }

    // Full well
    const fullWell = data.fullWell;
    const minFullWell = 1;
    if (
      Number.isNaN(fullWell) ||
      !Number.isInteger(fullWell) ||
      fullWell < minFullWell
    ) {
      errors.fullWell = `The full well must be a positive integer greater than or equal to ${minFullWell}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

type Props = {
  setupData: ExposureConfigurationType;
  update: (gains: ExposureConfigurationType) => void;
};

export function GainPanel({ setupData, update }: Props) {
  const updateGain = (gainValues: GainType) => {
    update({
      ...setupData,
      gain: new Gain(gainValues),
    });
  };
  return (
    <>
      <div className="columns">
        <div className="column pr-0 is-two-fifths">
          <GainTypeSelector
            updateGain={updateGain}
            gainType={setupData.gain.gainType}
          />
        </div>
        <div className="column pl-0">
          {(setupData.gain.gainType === "Bright Object" ||
            setupData.gain.gainType === "Faint Object") && (
            <NonEditableGainPanel gain={setupData.gain} />
          )}
          {setupData.gain.gainType === "Custom Object" && (
            <CustomObject update={updateGain} gain={setupData.gain} />
          )}
        </div>
      </div>
    </>
  );
}
