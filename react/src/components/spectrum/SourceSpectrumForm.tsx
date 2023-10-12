import SpectrumSelector from "./SpectrumSelector";
import SpectrumForm from "./SpectrumForm";
import { ReactElement, useContext } from "react";
import SimulationSetupContext from "../SimulationSetupContext.js";
import { Spectrum, SpectrumType } from "../../types";
import Blackbody, { BlackbodySpectrum } from "./Blackbody";

function makeSpectrumForm(
  type: SpectrumType,
  spectrum: Spectrum,
  update: (spectrum: Spectrum) => void,
): ReactElement {
  switch (type) {
    case "Blackbody":
      return (
        <Blackbody blackbody={spectrum as BlackbodySpectrum} update={update} />
      );
    default:
      throw new Error(`No spectrum form defined for type "${type}.`);
  }
}

interface Props {
  sourceSpectrum: Spectrum[];
}

export default function SourceSpectrumForm({ sourceSpectrum }: Props) {
  const { removeFromSourceSpectrum, updateSourceSpectrum } = useContext(
    SimulationSetupContext,
  );
  return (
    <>
      <SpectrumSelector />
      {sourceSpectrum.map((spectrum, index) => (
        <SpectrumForm
          remove={() => removeFromSourceSpectrum(index)}
          key={index}
        >
          {makeSpectrumForm("Blackbody", spectrum, (spectrum) => {
            updateSourceSpectrum(index, spectrum);
          })}
        </SpectrumForm>
      ))}
    </>
  );
}
