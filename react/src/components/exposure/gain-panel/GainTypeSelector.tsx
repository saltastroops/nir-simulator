export function GainTypeSelector({ updateGain, gainType }: any) {
  const faintObjectDefaults = {
    gainType: "Faint Object",
    firstValue: "2.04",
    readNoice: "17",
    fullWell: "60000",
  };
  const brightObjectDefaults = {
    gainType: "Bright Object",
    firstValue: "5.74",
    readNoice: "20",
    fullWell: "120000",
  };

  const customObjectDefaults = {
    gainType: "Custom Object",
    firstValue: "1",
    readNoice: "10",
    fullWell: "100000",
  };
  const update = (value: any) => {
    const updateSource =
      value === "Faint Object"
        ? faintObjectDefaults
        : value === "Bright Object"
        ? brightObjectDefaults
        : customObjectDefaults;
    updateGain(updateSource);
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
