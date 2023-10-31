import { Gain, GainParameters, GainType } from "./GainPanel.tsx";

interface Props {
  updateGain: (newGainValues: Gain) => void;
  gainType: GainType;
}

export function GainSelector({ updateGain, gainType }: Props) {
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
      adu: "1",
      readNoise: "10",
      fullWell: "100000",
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
              checked={gainType === "Faint"}
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
              checked={gainType === "Bright"}
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
              checked={gainType === "Custom"}
              onChange={() => update("Custom")}
            />
            Custom Object
          </label>
        </div>
      </div>
    </>
  );
}
