import SourceForm, { Source } from "./SourceForm";
import MoonPanel, { Moon } from "./MoonPanel.tsx";
import SunPanel, { Sun } from "./SunPanel.tsx";
import { Earth, EarthPanel } from "./EarthPanel.tsx";
import SpectrumPlotOptionsPanel, {
  SpectrumPlotOptions,
} from "./SpectrumPlotOptionsPanel.tsx";
import { button } from "../utils.ts";
import { SimulationSetup } from "../Simulator.tsx";
import { spectra } from "../../services.ts";

interface Props {
  setup: SimulationSetup;
  updateSetup: (property: string, value: any) => void;
}

export function SpectrumGenerationTab({ setup, updateSetup }: Props) {
  const { source, sun, moon, earth, spectrumPlotOptions } = setup;

  const updatePlots = async () => {
    const spectraData = await spectra(setup);
    console.log({ spectraData });
  };

  return (
    <div className="bg-gray-50">
      <fieldset className="border border-solid border-gray-300 p-3">
        <legend>Source Spectrum</legend>
        <SourceForm
          source={source}
          update={(source: Source) => updateSetup("source", source)}
        />
      </fieldset>
      <fieldset className="border border-solid border-gray-300 p-3 mt-4">
        <legend>Solar Items</legend>
        <SunPanel sun={sun} update={(sun: Sun) => updateSetup("sun", sun)} />
      </fieldset>
      <fieldset className="border border-solid border-gray-300 p-3 mt-4">
        <legend>Lunar Items</legend>
        <MoonPanel
          moon={moon}
          update={(moon: Moon) => updateSetup("moon", moon)}
        />
      </fieldset>
      <fieldset className="border border-solid border-gray-300 p-3 mt-4">
        <legend>Earthly Items</legend>
        <EarthPanel
          earth={earth}
          update={(earth: Earth) => updateSetup("earth", earth)}
        />
      </fieldset>
      <fieldset className="border border-solid border-gray-300 p-3 mt-4">
        <legend>Source Plot Options</legend>
        <SpectrumPlotOptionsPanel
          spectrumPlotOptions={spectrumPlotOptions}
          update={(options: SpectrumPlotOptions) =>
            updateSetup("spectrumPlotOptions", options)
          }
        />
      </fieldset>

      <button
        className={button("mt-6 text-white bg-green-600")}
        onClick={updatePlots}
      >
        Show Spectrum
      </button>
    </div>
  );
}
