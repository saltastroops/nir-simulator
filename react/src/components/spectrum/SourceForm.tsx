import SpectrumSelector from "./SpectrumSelector";
import SpectrumForm from "./SpectrumForm";
import { ReactElement } from "react";
import { Source, Spectrum, SpectrumType } from "../../types";
import BlackbodyPanel from "./BlackbodyPanel";
import Blackbody from "../../spectrum/Blackbody";
import EmissionLinePanel from "./EmissionLinePanel";
import GalaxyPanel from "./GalaxyPanel";
import UserDefinedPanel from "./UserDefinedPanel.tsx";
import Galaxy from "../../spectrum/Galaxy";
import EmissionLine from "../../spectrum/EmissionLine";
import UserDefined from "../../spectrum/UserDefined.ts";

function makeSpectrum(type: SpectrumType): Spectrum {
  switch (type) {
    case "Blackbody":
      return new Blackbody();
    case "Galaxy":
      return new Galaxy();
    case "Emission Line":
      return new EmissionLine();
    case "User-Defined":
      return new UserDefined();
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
        <BlackbodyPanel blackbody={spectrum as Blackbody} update={update} />
      );
    case "Galaxy":
      return <GalaxyPanel galaxy={spectrum as Galaxy} update={update} />;
    case "Emission Line":
      return (
        <EmissionLinePanel
          emissionLine={spectrum as EmissionLine}
          update={update}
        />
      );
    case "User-Defined":
      return (
        <UserDefinedPanel
          userDefined={spectrum as UserDefined}
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
