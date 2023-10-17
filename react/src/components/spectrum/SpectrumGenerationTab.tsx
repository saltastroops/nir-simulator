import SourceForm from "./SourceForm";
import { Source } from "../../types";
import MoonPanel, { Moon } from "./MoonPanel.tsx";
import SunPanel, { Sun } from "./SunPanel.tsx";
import { Earth, EarthPanel } from "./EarthPanel.tsx";

interface Props {
  source: Source;
  sun: Sun;
  moon: Moon;
  earth: Earth;
  updateSetup: (property: string, value: any) => void;
}

export function SpectrumGenerationTab({
  source,
  sun,
  moon,
  earth,
  updateSetup,
}: Props) {
  return (
    <div>
      <h1 className="title is-1">Generate Spectra</h1>
      <SourceForm
        source={source}
        update={(source: Source) => updateSetup("source", source)}
      />
      <SunPanel sun={sun} update={(sun: Sun) => updateSetup("sun", sun)} />
      <MoonPanel
        moon={moon}
        update={(moon: Moon) => updateSetup("moon", moon)}
      />
      <EarthPanel
        earth={earth}
        update={(earth: Earth) => updateSetup("earth", earth)}
      />
    </div>
  );
}
