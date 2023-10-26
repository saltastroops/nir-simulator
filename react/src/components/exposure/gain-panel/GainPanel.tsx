import { GainTypeSelector } from "./GainTypeSelector.tsx";
import { NonEditableGainPanel } from "./NonEditableGainPanel.tsx";
import { CustomObject } from "./CustomObject.tsx";
import {
  ExposureConfigurationType,
  Gain,
  GainType,
} from "../ExposurePanel.tsx";

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
