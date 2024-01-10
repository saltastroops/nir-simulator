import { GainParameters } from "./GainPanel.tsx";

interface Props {
  gain: GainParameters;
}

export function NonEditableGainPanel({ gain }: Props) {
  return (
    <div>
      <div className="flex" style={{ minWidth: "140px" }}>
        <div className="">Gain:</div>
        <div className="pl-2 ">{gain.gain} e/ADU</div>
      </div>
      <div className="flex">
        <div className="">Read Noise: </div>
        <div className="pl-2 "> {gain.readNoise}</div>
      </div>
      <div className="flex">
        <div className="">Full Well: </div>
        <div className="pl-2">{gain.fullWell} e</div>
      </div>
    </div>
  );
}
