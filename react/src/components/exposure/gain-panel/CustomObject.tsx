import { GainType } from "../ExposurePanel.tsx";

type Params = {
  gain: GainType;
  update: (gain: GainType) => void;
};

export function CustomObject({ gain, update }: Params) {
  const updateGain = (
    name: "adu" | "fullWell" | "readNoise",
    value: string,
  ) => {
    update({
      ...gain,
      [name]: value,
    });
  };
  return (
    <div className="notification">
      <div className="columns is-gepless">
        <div className="column">
          <div className="control">
            <input
              className="input"
              name={"adu"}
              type="text"
              value={gain.adu}
              onChange={(event) => updateGain("adu", event.target.value)}
            />
          </div>
        </div>
        <div className="column ">e/ADU</div>
      </div>
      <div className="columns">
        <div className="column">Read Noise: </div>
        <div className="column">
          <div className="control">
            <input
              className="input"
              name={"readNoise"}
              type="text"
              value={gain.readNoise}
              onChange={(event) => updateGain("readNoise", event.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="column">Full Well: </div>
        <div className="column">
          <div className="control">
            <input
              className="input"
              name={"fullWell"}
              type="text"
              value={gain.fullWell}
              onChange={(event) => updateGain("fullWell", event.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
