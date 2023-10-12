import SourceSpectrumForm from "./SourceSpectrumForm";
import { SimulationSetup } from "../../types";

interface Props {
  simulationSetup: SimulationSetup;
}

export function SpectrumGenerationTab({ simulationSetup }: Props) {
  return (
    <div>
      <h1 className="title is-1">Generate Spectra</h1>
      <SourceSpectrumForm sourceSpectrum={simulationSetup.sourceSpectrum} />
    </div>
  );
}
