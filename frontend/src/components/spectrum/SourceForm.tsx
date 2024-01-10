import SpectrumSelector from "./SpectrumSelector";
import SpectrumForm from "./SpectrumForm";
import { ReactElement } from "react";
import { Spectrum, SpectrumType } from "../../types";
import BlackbodyPanel, { Blackbody } from "./BlackbodyPanel";
import EmissionLinePanel, { EmissionLine } from "./EmissionLinePanel";
import GalaxyPanel, { Galaxy } from "./GalaxyPanel";
import UserDefinedPanel, { UserDefined } from "./UserDefinedPanel.tsx";

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

  public get data() {
    return {
      spectrum: this.spectrum.map((s) => ({
        ...s.data,
        spectrumType: s.spectrumType,
      })),
      type: this.type,
    };
  }
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
  switch (spectrum.spectrumType) {
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
      throw new Error(
        `No spectrum form defined for type "${spectrum.spectrumType}.`,
      );
  }
}

interface Props {
  source: Source;
  update: (source: Source) => void;
}

export default function SourceForm({ source, update }: Props) {
  const addToSourceSpectrum = (type: SpectrumType) => {
    const updatedSpectrum = [...source.spectrum, makeSpectrum(type)];
    update(
      new Source({
        ...source,
        spectrum: updatedSpectrum,
      }),
    );
  };

  const removeFromSourceSpectrum = (index: number) => {
    const updatedSourceSpectrum = [...source.spectrum];
    updatedSourceSpectrum.splice(index, 1);
    update(
      new Source({
        ...source,
        spectrum: updatedSourceSpectrum,
      }),
    );
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
    update(
      new Source({
        ...source,
        type: sourceType,
      }),
    );
  };

  return (
    <div>
      {/* spectrum */}
      <SpectrumSelector
        onSelect={(type: SpectrumType) => addToSourceSpectrum(type)}
      />
      {source.spectrum.map((spectrum, index) => (
        <SpectrumForm
          label={spectrum.spectrumType}
          remove={() => removeFromSourceSpectrum(index)}
          key={index}
        >
          {makeSpectrumForm(spectrum, (spectrum) => {
            updateSourceSpectrum(index, spectrum);
          })}
        </SpectrumForm>
      ))}

      {/* source type */}
      <div className="border border-gray-200 p-2 mt-3">
        <div className="field">
          <div className="control">
            <label>
              <input
                type="radio"
                className="cursor-pointer"
                name="source-type"
                value="Point"
                onChange={() => updateSourceType("Point")}
                checked={source.type === "Point"}
              />
              <span className="ml-2">This is a point source</span>
            </label>
          </div>

          <div className="control">
            <label>
              <input
                type="radio"
                className="cursor-pointer"
                name="source-type"
                value="Diffuse"
                onChange={() => updateSourceType("Diffuse")}
                checked={source.type === "Diffuse"}
              />
              <span className="ml-2">This is a diffuse source</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
