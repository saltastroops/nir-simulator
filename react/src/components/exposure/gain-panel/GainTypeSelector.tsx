import { GainType, GainTypeType } from "./GainPanel.tsx";

interface Props {
  updateGain: (newGainValues: GainType) => void;
  gainType: GainTypeType;
}

export function GainTypeSelector({ updateGain, gainType }: Props) {
  const faintGain: GainType = {
    gainType: "Faint",
    adu: "2.04",
    readNoise: "17",
    fullWell: "60000",
  };
  const brightGain: GainType = {
    gainType: "Bright",
    adu: "5.74",
    readNoise: "20",
    fullWell: "120000",
  };
  const update = (value: GainTypeType) => {
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
    updateGain(newGainValues as GainType);
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
