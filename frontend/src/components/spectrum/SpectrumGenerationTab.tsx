import SourceForm, { Source } from "./SourceForm";
import { Earth, EarthPanel } from "./EarthPanel.tsx";
import { button, exposureFormData } from "../utils.ts";
import { SimulationSetup } from "../Simulator.tsx";
import { spectra } from "../../services.ts";
import { useMemo, useState } from "react";
import { defaultLinePlotOptions } from "../plots/PlotOptions.ts";
import { LinePlot } from "../plots/LinePlot.tsx";
import { ChartContent } from "../instrument/InstrumentConfigurationTab.tsx";
import { isEqual } from "lodash";

interface Props {
  setup: SimulationSetup;
  updateSetup: (property: string, value: any) => void;
}

export function SpectrumGenerationTab({ setup, updateSetup }: Props) {
  const { source, earth } = setup;
  const fluxUnits =
    source.type == "Point" ? "erg/(cm² s Å)" : "erg/(cm² s arcsec² Å)";

  const [sourceChartContent, setSourceChartContent] = useState<ChartContent>({
    chartData: {
      x: [],
      y: [],
      lineColor: "rgb(255, 0, 0)",
      options: defaultLinePlotOptions(
        "Wavelength (Å)",
        `Flux(${fluxUnits})`,
        "Source Spectrum",
      ),
    },
    requested: false,
  });
  const [error, setError] = useState<string | null>(null);
  const sourceChart = useMemo(
    () => <LinePlot chartContent={sourceChartContent} />,
    [sourceChartContent],
  );

  const [skyChartContent, setSkyChartContent] = useState<ChartContent>({
    chartData: {
      x: [],
      y: [],
      lineColor: "rgb(75,100,192)",
      options: defaultLinePlotOptions(
        "Wavelength (Å)",
        "Flux (erg/(cm² s arcsec² Å)",
        "Sky Background Spectrum",
      ),
    },
    requested: false,
  });
  const skyChart = useMemo(
    () => <LinePlot chartContent={skyChartContent} />,
    [skyChartContent],
  );

  const updatePlots = async () => {
    try {
      const spectraData = await spectra(setup);
      const sourceData = spectraData.source;
      const skyData = spectraData.sky;

      setSourceChartContent((previousChartContent) => {
        const updatedChartData = {
          x: sourceData.wavelengths,
          y: sourceData.fluxes,
          lineColor: previousChartContent.chartData.lineColor,
          options: defaultLinePlotOptions(
            "Wavelength (Å)",
            `Flux (${fluxUnits})`,
            "Source Spectrum",
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
          options: previousChartContent.chartData.options,
        };
        setPlotMetadata(currentMetadata);
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

  const [plotMetadata, setPlotMetadata] = useState({} as any);

  const currentMetadata = exposureFormData(setup);
  const isPlotOutdated = !isEqual(currentMetadata, plotMetadata);

  return (
    <div className="flex flex-col md:flex-row">
      <div className="mr-2 ml-2 max-w-[378px] mb-3">
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
        {!sourceChartContent.requested && (
          <div className={"relative md:h-screen"}>
            <p className={"absolute top-10 left-10 m-4"}>
              Press the "Show Spectrum" to generate the plots
            </p>
          </div>
        )}

        {sourceChartContent.requested && (
          <div>
            <div className="bg-gray-50 p-2">
              <div className={!error ? "" : "bg-red-300"}>
                <div className="chart-container">
                  {isPlotOutdated && sourceChartContent.requested && (
                    <div className="watermark">Outdated</div>
                  )}
                  {sourceChart}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 mt-2 p-2">
              <div className={!error ? "" : "bg-red-300"}>
                <div className="chart-container">
                  {isPlotOutdated && sourceChartContent.requested && (
                    <div className="watermark">Outdated</div>
                  )}
                  {skyChart}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
