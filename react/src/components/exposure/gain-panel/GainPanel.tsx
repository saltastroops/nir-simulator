import { GainTypeSelector } from "./GainTypeSelector.tsx";
import { NonEditableGainPanel } from "./NonEditableGainPanel.tsx";
import { CustomGainPanel } from "./CustomGainPanel.tsx";
import {
  ExposureConfiguration,
  ExposureConfigurationType,
} from "../ExposurePanel.tsx";

export type GainTypeType = "Faint" | "Bright" | "Custom";

export interface GainType {
  gainType: GainTypeType;
  adu: string;
  readNoise: string;
  fullWell: string;
}
export class Gain {
  public gainType: GainTypeType = "Faint";
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
      adu: parseInt(this.adu),
      readNoise: parseFloat(this.readNoise),
      fullWell: parseInt(this.fullWell),
    };
  }

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    const adu = data.adu;
    const minAdu = 1;

    if (Number.isNaN(adu) || !Number.isInteger(adu) || adu < minAdu) {
      errors.adu = `The ADU must be a positive integer greater than or equal to ${minAdu}.`;
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
  setupData: ExposureConfiguration;
  update: (gains: ExposureConfigurationType) => void;
}

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
          {(setupData.gain.gainType === "Bright" ||
            setupData.gain.gainType === "Faint") && (
            <NonEditableGainPanel gain={setupData.gain} />
          )}
          {setupData.gain.gainType === "Custom" && (
            <CustomGainPanel update={updateGain} gain={setupData.gain} />
          )}
        </div>
      </div>
    </>
  );
}
