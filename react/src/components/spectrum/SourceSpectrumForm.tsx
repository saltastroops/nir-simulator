import SpectrumSelector from "./SpectrumSelector";
import SpectrumForm from "./SpectrumForm";
import { useContext } from "react";
import SimulationSetupContext from "../SimulationSetupContext.js";
import { Spectrum } from "../../types";

interface Props {
  sourceSpectrum: Spectrum[];
}

export default function SourceSpectrumForm({ sourceSpectrum }: Props) {
  const { removeFromSourceSpectrum } = useContext(SimulationSetupContext);
  return (
    <>
      <SpectrumSelector />
      {sourceSpectrum.map((component, index) => (
        <SpectrumForm
          remove={() => removeFromSourceSpectrum(index)}
          key={index}
        >
          {component.type}
        </SpectrumForm>
      ))}
    </>
  );
}
