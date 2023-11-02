import { Gain, GainParameters, GainType } from "./GainPanel.tsx";

interface Props {
  updateGain: (newGainValues: Gain) => void;
  gain: Gain;
}

export function GainSelector({ updateGain, gain }: Props) {
  const faintGain = {
    gainType: "Faint",
    adu: "2.04",
    readNoise: "17",
    fullWell: "60000",
  };
  const brightGain = {
    gainType: "Bright",
    adu: "5.74",
    readNoise: "20",
    fullWell: "120000",
  };
  const update = (value: GainType) => {
    let newGainValues = {
      gainType: "Custom",
      adu: gain.adu,
      readNoise: gain.readNoise,
      fullWell: gain.fullWell,
    };
    if (value === "Faint") {
      newGainValues = faintGain;
    }
    if (value === "Bright") {
      newGainValues = brightGain;
    }
    updateGain(new Gain(newGainValues as GainParameters));
  };

  return (
    <>
      <div className="field">
        <div className="control">
          <label className="radio">
            <input
              className="mr-2"
              type="radio"
              name="gain-type"
              checked={gain.gainType === "Faint"}
              onChange={() => update("Faint")}
            />
            Faint Object
          </label>
        </div>
      </div>
      <div className="field">
        <div className="control">
          <label className="radio">
            <input
              className="mr-2"
              type="radio"
              name="gain-type"
              checked={gain.gainType === "Bright"}
              onChange={() => update("Bright")}
            />
            Bright Object
          </label>
        </div>
      </div>
      <div className="field">
        <div className="control">
          <label className="radio">
            <input
              className="mr-2"
              type="radio"
              name="gain-type"
              checked={gain.gainType === "Custom"}
              onChange={() => update("Custom")}
            />
            Custom Object
          </label>
        </div>
      </div>
    </>
  );
}
