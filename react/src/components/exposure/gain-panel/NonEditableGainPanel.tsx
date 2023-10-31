import { GainParameters } from "./GainPanel.tsx";

interface Props {
  gain: GainParameters;
}

export function NonEditableGainPanel({ gain }: Props) {
  return (
    <div className="notification">
      <div className="columns">
        <div className="column ">{gain.adu} e/ADU</div>
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
