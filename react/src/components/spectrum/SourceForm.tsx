import SpectrumSelector from "./SpectrumSelector";
import SpectrumForm from "./SpectrumForm";
import { ReactElement } from "react";
import { Spectrum, SpectrumType } from "../../types";
import BlackbodyPanel from "./BlackbodyPanel";
import Blackbody from "../../spectrum/Blackbody";
import EmissionLinePanel from "./EmissionLinePanel";
import GalaxyPanel from "./GalaxyPanel";
import UserDefinedPanel from "./UserDefinedPanel.tsx";
import Galaxy from "../../spectrum/Galaxy";
import EmissionLine from "../../spectrum/EmissionLine";
import UserDefined from "../../spectrum/UserDefined.ts";

export type SourceType = "Point" | "Diffuse";

interface SourceParameters {
  spectrum: Spectrum[];
  type: SourceType;
}

export class Source {
  spectrum: Spectrum[] = [];
  type: SourceType = "Point";

  public constructor(parameters?: SourceParameters) {
    if (parameters) {
      this.spectrum = parameters.spectrum;
      this.type = parameters.type;
    }
  }

  public data = () => ({
    spectrum: this.spectrum.map((s) => s.data()),
    type: this.type,
  });
}

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
    const updatedSourceParameters: SourceParameters = {
      spectrum: updatedSourceSpectrum,
      type: source.type,
    };
    update(new Source(updatedSourceParameters));
  };

  const updateSourceType = (sourceType: SourceType) => {
    update({
      ...source,
      type: sourceType,
    });
  };

  return (
    <>
      {/* spectrum */}
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

      {/* source type */}
      <div>
        <label>
          <input
            type="radio"
            name="source-type"
            value="Point"
            onChange={() => updateSourceType("Point")}
            checked={source.type === "Point"}
          />
          This is a point source
        </label>
        <label>
          <input
            type="radio"
            name="source-type"
            value="Diffuse"
            onChange={() => updateSourceType("Diffuse")}
            checked={source.type === "Diffuse"}
          />
          This is a diffuse source
        </label>
      </div>
    </>
  );
}
