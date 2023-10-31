import { Gain, GainType } from "./GainPanel.tsx";
import { Error } from "../../Error.tsx";

interface Props {
  gain: Gain;
  update: (gain: GainType) => void;
}

export function CustomGainPanel({ gain, update }: Props) {
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
        <div className="column pb-0">
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
        <div className="column pb-0">e/ADU</div>
      </div>
      {gain.errors["adu"] && (
        <div className="columns">
          <div className="column pt-0">
            <Error error={gain.errors["adu"]} />
          </div>
        </div>
      )}
      <div className="columns">
        <div className="column pb-0">Read Noise: </div>
        <div className="column pb-0">
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

      {gain.errors["readNoise"] && (
        <div className="columns">
          <div className="column pt-0">
            <Error error={gain.errors["readNoise"]} />
          </div>
        </div>
      )}

      <div className="columns">
        <div className="column pb-0">Full Well: </div>
        <div className="column pb-0">
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
      {gain.errors["fullWell"] && (
        <div className="columns">
          <div className="column pt-0">
            <Error error={gain.errors["fullWell"]} />
          </div>
        </div>
      )}
    </div>
  );
}
