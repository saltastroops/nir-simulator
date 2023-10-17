import SourceForm from "./SourceForm";
import { Source } from "../../types";
import MoonPanel, { Moon } from "./MoonPanel.tsx";

interface Props {
  source: Source;
  moon: Moon;
  updateSetup: (property: string, value: any) => void;
}

export function SpectrumGenerationTab({ source, moon, updateSetup }: Props) {
  return (
    <div>
      <h1 className="title is-1">Generate Spectra</h1>
      <SourceForm
        source={source}
        update={(source: Source) => updateSetup("source", source)}
      />
      <MoonPanel
        moon={moon}
        update={(moon: Moon) => updateSetup("moon", moon)}
      />
    </div>
  );
}
