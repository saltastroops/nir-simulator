import SpectrumSelector from "./SpectrumSelector";
import SpectrumForm from "./SpectrumForm";
import { ReactElement } from "react";
import { Source, Spectrum, SpectrumType } from "../../types";
import Blackbody, {
  BlackbodySpectrum,
  makeDefaultBlackbody,
} from "./Blackbody";

function makeSpectrum(type: SpectrumType): Spectrum {
  switch (type) {
    case "Blackbody":
      return makeDefaultBlackbody();
    case "Galaxy":
      return { type: "Galaxy", parameters: {}, errors: {} };
    case "Emission Line":
      return { type: "Emission Line", parameters: {}, errors: {} };
    default:
      throw new Error(`Cannot create spectrum of type "${type}".`);
  }
}

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
  source: Source;
  update: (source: Source) => void;
}

export default function SourceForm({ source, update }: Props) {
  const addToSourceSpectrum = (type: SpectrumType) => {
    const updatedSpectrum = [...source.spectrum, makeSpectrum(type)];
    update({
      ...source,
      spectrum: updatedSpectrum,
    });
  };

  const removeFromSourceSpectrum = (index: number) => {
    const updatedSourceSpectrum = [...source.spectrum];
    updatedSourceSpectrum.splice(index, 1);
    update({
      ...source,
      spectrum: updatedSourceSpectrum,
    });
  };

  const updateSourceSpectrum = (index: number, spectrum: Spectrum) => {
    const updatedSourceSpectrum = [...source.spectrum];
    updatedSourceSpectrum[index] = spectrum;
    update({
      ...source,
      spectrum: updatedSourceSpectrum,
    });
  };
  return (
    <>
      <SpectrumSelector
        onSelect={(type: SpectrumType) => addToSourceSpectrum(type)}
      />
      {source.spectrum.map((spectrum, index) => (
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
