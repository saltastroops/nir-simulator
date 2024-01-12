import SourceForm, { Source } from "./SourceForm";
import { Earth, EarthPanel } from "./EarthPanel.tsx";
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
  const { source, earth } = setup;

  const [sourceChartContent, setSourceChartContent] = useState<ChartContent>({
    chartData: {
      x: [],
      y: [],
      lineColor: "rgb(255, 0, 0)",
      options: defaultLinePlotOptions(
        "Wavelength (\u212B)",
        "Flux",
        "Source Spectrum",
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
      lineColor: "rgb(75,100,192)",
      options: defaultLinePlotOptions(
        "Wavelength (\u212B)",
        "Flux",
        "Sky Background Spectrum",
      ),
    },
    requested: false,
  });
  const skyChart = useMemo(
    () => (
      <LinePlot
        chartContent={skyChartContent}
        isOutdated={false && skyChartContent.requested}
      />
    ),
    [skyChartContent],
  );

  const updatePlots = async () => {
    try {
      const spectraData = await spectra(setup);
      const sourceData = spectraData.source;
      const skyData = spectraData.sky;
      const fluxUnits =
        source.type == "Point" ? "erg/(cm² s)" : "erg/(cm² s arcsec²)";

      setSourceChartContent((previousChartContent) => {
        const updatedChartData = {
          x: sourceData.wavelengths,
          y: sourceData.fluxes,
          lineColor: previousChartContent.chartData.lineColor,
          options: defaultLinePlotOptions(
            "Wavelength (\u212B)",
            `Flux (${fluxUnits})`,
            "Sky Background Spectrum",
          ),
        };
        setError(null);
        return {
          chartData: updatedChartData,
          requested: true,
        };
      });

      setSkyChartContent((previousChartContent) => {
        const updatedChartData = {
          x: skyData.wavelengths,
          y: skyData.fluxes,
          lineColor: previousChartContent.chartData.lineColor,
          options: defaultLinePlotOptions(
            "Wavelength (\u212B)",
            `Flux (${fluxUnits})`,
            "Sky Background Spectrum",
          ),
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

  return (
    <div className="flex">
      <div className="mr-2 ml-2">
        <div className="bg-gray-50 p-2">
          <fieldset className="border border-solid border-gray-300 p-3">
            <legend>Source Spectrum</legend>
            <SourceForm
              source={source}
              update={(source: Source) => updateSetup("source", source)}
            />
          </fieldset>

          <div className="mt-4 mb-4 p-2 border border-orange-300 bg-yellow-50 text-orange-300 font-semibold max-w-[350px]">
            The NIRWALS Simulator currently uses the same atmospheric background
            spectrum irrespective of solar and lunar conditions.
          </div>
          {/*<fieldset className="border border-solid border-gray-300 p-3 mt-4">*/}
          {/*  <legend>Solar Items</legend>*/}
          {/*  <SunPanel*/}
          {/*    sun={sun}*/}
          {/*    update={(sun: Sun) => updateSetup("sun", sun)}*/}
          {/*  />*/}
          {/*</fieldset>*/}
          {/*<fieldset className="border border-solid border-gray-300 p-3 mt-4">*/}
          {/*  <legend>Lunar Items</legend>*/}
          {/*  <MoonPanel*/}
          {/*    moon={moon}*/}
          {/*    update={(moon: Moon) => updateSetup("moon", moon)}*/}
          {/*  />*/}
          {/*</fieldset>*/}
          <fieldset className="border border-solid border-gray-300 p-3 mt-4">
            <legend>Earthly Items</legend>
            <EarthPanel
              earth={earth}
              update={(earth: Earth) => updateSetup("earth", earth)}
            />
          </fieldset>
          {/*<fieldset className="border border-solid border-gray-300 p-3 mt-4">*/}
          {/*  <legend>Source Plot Options</legend>*/}
          {/*  <SpectrumPlotOptionsPanel*/}
          {/*    spectrumPlotOptions={spectrumPlotOptions}*/}
          {/*    update={(options: SpectrumPlotOptions) =>*/}
          {/*      updateSetup("spectrumPlotOptions", options)*/}
          {/*    }*/}
          {/*  />*/}
          {/*</fieldset>*/}

          <button
            className={button("mt-3 text-white bg-green-600")}
            onClick={updatePlots}
          >
            Show Spectrum
          </button>
          {error && (
            <div>
              <p className={"has-text-danger"}>{error}</p>
            </div>
          )}
        </div>
      </div>
      <div className="ml-2 w-full">
        <div className="bg-gray-50 p-2">
          <div className={!error ? "" : "bg-red-300"}>{sourceChart}</div>
        </div>
        <div className="bg-gray-50 mt-2 p-2">
          <div className={!error ? "" : "bg-red-300"}>{skyChart}</div>
        </div>
      </div>
    </div>
  );
}
