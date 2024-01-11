import { GainParameters } from "./GainPanel.tsx";

interface Props {
  gain: GainParameters;
}

export function NonEditableGainPanel({ gain }: Props) {
  return (
    <div>
      <div>
        <p>Gain: {gain.gain} e/ADU</p>
        <p>Read Noise: {gain.readNoise}</p>
        <p>Full Well: {gain.fullWell} e</p>
      </div>
    </div>
  );
}
