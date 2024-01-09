import { GainParameters } from "./GainPanel.tsx";

interface Props {
  gain: GainParameters;
}

export function NonEditableGainPanel({ gain }: Props) {
  return (
    <div>
      <div className="columns">
        <div className="column ">Gain:</div>
        <div className="column ">{gain.gain} e/ADU</div>
      </div>
      <div className="columns">
        <div className="column ">Read Noise: </div>
        <div className="column "> {gain.readNoise} e</div>
      </div>
      <div className="columns">
        <div className="column ">Full Well: </div>
        <div className="column ">{gain.fullWell} e</div>
      </div>
    </div>
  );
}
