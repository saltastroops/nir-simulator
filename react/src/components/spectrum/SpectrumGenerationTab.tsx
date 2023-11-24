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
import { useMemo, useState } from "react";
import { defaultLinePlotOptions } from "../plots/PlotOptions.ts";
import { LinePlot } from "../plots/LinePlot.tsx";
import { ChartContent } from "../instrument/InstrumentConfigurationPanel.tsx";

interface Props {
  setup: SimulationSetup;
  updateSetup: (property: string, value: any) => void;
}

export function SpectrumGenerationTab({ setup, updateSetup }: Props) {
  const { source, sun, moon, earth, spectrumPlotOptions } = setup;

  const [sourceChartContent, setSourceChartContent] = useState<ChartContent>({
    chartData: {
      x: [],
      y: [],
      lineColor: "rgb(255, 0, 0)",
      options: defaultLinePlotOptions(
        "Wavelength (\u212B)",
        "Flux (photons sec\u002D\u00B9 \u212B cm\u002D\u00B2)",
          "Source Spectrum"
      ),
    },
    requested: false,
  });
  const [error, setError] = useState<string | null>(null);
  const sourceChart = useMemo(
    () => (
      <LinePlot
        chartContent={sourceChartContent}
        isOutdated={false && sourceChartContent.requested}
      />
    ),
    [sourceChartContent],
  );

  const [skyChartContent, setSkyChartContent] = useState<ChartContent>({
    chartData: {
      x: [],
      y: [],
      lineColor: "rgb(75,100,192)" ,
      options: defaultLinePlotOptions(
          "Wavelength (\u212B)",
          "Flux (photons sec\u002D\u00B9 \u212B cm\u002D\u00B2)",
          "Sky Background Spectrum"
      ),
    },
    requested: false,
  });
  const skyChart = useMemo(
      () => (
          <LinePlot
              chartContent={secondChartContent}
              isOutdated={false && secondChartContent.requested}
          />
      ),
      [secondChartContent],
  );

  const updatePlots = async () => {
    try {
      const spectraData = await spectra(setup);
      const sourceData = spectraData.source;
      const skyData = spectraData.sky;

      setSourceChartContent((previousChartContent) => {
        const updatedChartData = {
          x: sourceData.x,
          y: sourceData.y,
          lineColor: previousChartContent.chartData.lineColor,
          options: previousChartContent.chartData.options,
        };
        return {
          chartData: updatedChartData,
          requested: true,
        };
      });

      setSkyChartContent((previousChartContent) => {
        const updatedChartData = {
          x: skyData.x,
          y: skyData.y,
          lineColor: previousChartContent.chartData.lineColor,
          options: previousChartContent.chartData.options,
        };
        return {
          chartData: updatedChartData,
          requested: true,
        };
      });
    } catch (error) {
      setError("Data request failed.");
      console.error("Error fetching plot data:", error);
    }
  };

  const clearPlots = async () => {
    try {
      setChartContent((previousChartContent) => {
        const updatedChartData = {
          x: [],
          y: [],
          lineColor: previousChartContent.chartData.lineColor,
          options: previousChartContent.chartData.options,
        };
        return {
          chartData: updatedChartData,
          requested: false,
        };
      });

      setSecondChartContent((previousChartContent) => {
        const updatedChartData = {
          x: [],
          y: [],
          lineColor: previousChartContent.chartData.lineColor,
          options: previousChartContent.chartData.options,
        };
        return {
          chartData: updatedChartData,
          requested: false,
        };
      });
    } catch (error) {
      setError("Data request failed.");
      console.error("Error fetching plot data:", error);
    }
  };

  return (
    <div className="columns">
      <div className="column">
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
            <SunPanel
              sun={sun}
              update={(sun: Sun) => updateSetup("sun", sun)}
            />
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

          <button
              className={button("mt-6 text-white bg-red-600")}
              onClick={clearPlots}
          >
            Clear Spectrum
          </button>
        </div>
      </div>
      <div className="column">
        <div className="bg-gray-50">
          <div className={!error ? "tile" : "tile notification is-danger"}>
            {sourceChart}
          </div>
        </div>
        <div className="bg-gray-50 mt-2">
          <div className={!error ? "tile" : "tile notification is-danger"}>
            {skyChart}
          </div>
        </div>
      </div>
    </div>
  );
}
