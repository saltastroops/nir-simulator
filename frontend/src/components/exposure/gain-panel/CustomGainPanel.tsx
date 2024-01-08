import { Gain } from "./GainPanel.tsx";
import { Error } from "../../Error.tsx";
import { input } from "../../utils.ts";

interface Props {
  gain: Gain;
  update: (gain: Gain) => void;
}

export function CustomGainPanel({ gain, update }: Props) {
  const updateGain = (
    name: "gain" | "fullWell" | "readNoise",
    value: string,
  ) => {
    update(
      new Gain({
        ...gain,
        [name]: value,
      }),
    );
  };

  return (
    <div>
      <div className="columns is-gepless">
        <div className="column pb-0">
          <div className="control">
            <input
              className={input("w-28")}
              name={"gain"}
              type="text"
              value={gain.gain}
              onChange={(event) => updateGain("gain", event.target.value)}
            />
          </div>
        </div>
        <div className="column pb-0 pl-0">e/ADU</div>
      </div>
      {gain.errors["gain"] && (
        <div className="columns">
          <div className="column pt-0">
            <Error error={gain.errors["gain"]} />
          </div>
        </div>
      )}
      <div className="columns">
        <div className="column pr-0 pb-0">Read Noise: </div>
        <div className="column pb-0 pl-0">
          <div className="control">
            <input
              className={input("w-32")}
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
        <div className="column pr-0 pb-0">Full Well: </div>
        <div className="column pb-0 pl-0">
          <div className="control">
            <input
              className={input("w-32")}
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
