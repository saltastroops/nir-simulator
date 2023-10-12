import SourceSpectrumForm from "./SourceSpectrumForm";
import { SimulationSetup } from "../../types";
import Blackbody, { makeDefaultBlackbody } from "./Blackbody";

interface Props {
  simulationSetup: SimulationSetup;
}

export function SpectrumGenerationTab({ simulationSetup }: Props) {
  return (
    <div>
      <Blackbody blackbody={makeDefaultBlackbody()} />
      <h1 className="title is-1">Generate Spectra</h1>
      <SourceSpectrumForm sourceSpectrum={simulationSetup.sourceSpectrum} />
    </div>
  );
}
