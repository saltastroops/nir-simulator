import SourceForm from "./SourceForm";
import { Source } from "../../types";

interface Props {
  source: Source;
  updateSetup: (property: string, value: any) => void;
}

export function SpectrumGenerationTab({ source, updateSetup }: Props) {
  return (
    <div>
      <h1 className="title is-1">Generate Spectra</h1>
      <SourceForm
        source={source}
        update={(source: Source) => updateSetup("source", source)}
      />
    </div>
  );
}
