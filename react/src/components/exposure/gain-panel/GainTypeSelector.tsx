import { GainType } from "../ExposurePanel.tsx";

type Params = {
  updateGain: (newGainValues: GainType) => void;
  gainType: "Faint Object" | "Bright Object" | "Custom Object";
};

export function GainTypeSelector({ updateGain, gainType }: Params) {
  const faintObjectDefaults: GainType = {
    gainType: "Faint Object",
    adu: "2.04",
    readNoise: "17",
    fullWell: "60000",
  };
  const brightObjectDefaults: GainType = {
    gainType: "Bright Object",
    adu: "5.74",
    readNoise: "20",
    fullWell: "120000",
  };

  const customObjectDefaults: GainType = {
    gainType: "Custom Object",
    adu: "1",
    readNoise: "10",
    fullWell: "100000",
  };
  const update = (
    value: "Faint Object" | "Bright Object" | "Custom Object",
  ) => {
    const newGainValues =
      value === "Faint Object"
        ? faintObjectDefaults
        : value === "Bright Object"
        ? brightObjectDefaults
        : customObjectDefaults;
    updateGain(newGainValues);
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
              checked={gainType === "Faint Object"}
              onChange={() => update("Faint Object")}
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
              checked={gainType === "Bright Object"}
              onChange={() => update("Bright Object")}
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
              checked={gainType === "Custom Object"}
              onChange={() => update("Custom Object")}
            />
            Custom Object
          </label>
        </div>
      </div>
    </>
  );
}
