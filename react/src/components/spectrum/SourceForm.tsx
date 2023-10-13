import SpectrumSelector from "./SpectrumSelector";
import SpectrumForm from "./SpectrumForm";
import { ReactElement } from "react";
import { Source, Spectrum, SpectrumType } from "../../types";
import Blackbody, {
  BlackbodySpectrum,
  makeDefaultBlackbody,
} from "./Blackbody";
import EmissionLine, {
  EmissionLineSpectrum,
  makeDefaultEmissionLine,
} from "./EmissionLine";
import Galaxy, { GalaxySpectrum, makeDefaultGalaxy } from "./Galaxy";

function makeSpectrum(type: SpectrumType): Spectrum {
  switch (type) {
    case "Blackbody":
      return makeDefaultBlackbody();
    case "Galaxy":
      return makeDefaultGalaxy();
    case "Emission Line":
      return makeDefaultEmissionLine();
    default:
      throw new Error(`Cannot create spectrum of type "${type}".`);
  }
}

function makeSpectrumForm(
  spectrum: Spectrum,
  update: (spectrum: Spectrum) => void,
): ReactElement {
  switch (spectrum.type) {
    case "Blackbody":
      return (
        <Blackbody blackbody={spectrum as BlackbodySpectrum} update={update} />
      );
    case "Galaxy":
      return <Galaxy galaxy={spectrum as GalaxySpectrum} update={update} />;
    case "Emission Line":
      return (
        <EmissionLine
          emissionLine={spectrum as EmissionLineSpectrum}
          update={update}
        />
      );
    default:
      throw new Error(`No spectrum form defined for type "${spectrum.type}.`);
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
          {makeSpectrumForm(spectrum, (spectrum) => {
            updateSourceSpectrum(index, spectrum);
          })}
        </SpectrumForm>
      ))}
    </>
  );
}
