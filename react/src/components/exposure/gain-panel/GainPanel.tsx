import { GainTypeSelector } from "./GainTypeSelector.tsx";
import { FaintObject } from "./FaintObject.tsx";
import { BrightObject } from "./BrightObject.tsx";
import { CustomObject } from "./CustomObject.tsx";
import { Gain, GainType } from "../ExposurePanel.tsx";

export function GainPanel({ setupData, update }: any) {
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
          {setupData.gain.gainType === "Faint Object" && <FaintObject />}
          {setupData.gain.gainType === "Bright Object" && <BrightObject />}
          {setupData.gain.gainType === "Custom Object" && (
            <CustomObject updateObjectType={updateGain} gain={setupData.gain} />
          )}
        </div>
      </div>
    </>
  );
}
