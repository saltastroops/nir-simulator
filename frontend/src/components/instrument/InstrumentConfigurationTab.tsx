import { useMemo, useState } from "react";
import SpectroscopyConfigurationPanel, {
  SpectroscopyConfiguration,
} from "./SpectroscopyConfigurationPanel.tsx";
import { InstrumentMode } from "../../types.ts";
import ImagingConfigurationPanel, {
  ImagingConfiguration,
} from "./ImagingConfigurationPanel.tsx";
import { defaultLinePlotOptions, LineOptions } from "../plots/PlotOptions.ts";
import { LinePlot } from "../plots/LinePlot.tsx";
import { throughput } from "../../services.ts";
import { SimulationSetup } from "../Simulator.tsx";
import { button, select, throughputFormData } from "../utils.ts";
import { isEqual } from "lodash";

type ModeConfiguration = ImagingConfiguration | SpectroscopyConfiguration;

interface InstrumentConfigurationParameters {
  modeConfiguration: ModeConfiguration;
  filter: string;
}

export class InstrumentConfiguration {
  public modeConfiguration: ModeConfiguration = new SpectroscopyConfiguration();
  public filter: string = "clear-filter";

  public constructor(parameters?: InstrumentConfigurationParameters) {
    if (parameters) {
      this.modeConfiguration = parameters.modeConfiguration;
      this.filter = parameters.filter;
    }
  }

  public get data() {
    return {
      modeConfiguration: this.modeConfiguration.data,
      filter: this.filter,
    };
  }
}

export interface ChartContent {
  chartData: {
    x: number[];
    y: number[];
    lineColor: string;
    options: LineOptions;
  };
  requested: boolean;
}

interface Props {
  instrumentConfiguration: InstrumentConfiguration;
  setupData: SimulationSetup;
  update: (instrumentConfiguration: InstrumentConfiguration) => void;
}

export function InstrumentConfigurationTab({
  instrumentConfiguration,
  setupData,
  update,
}: Props) {
  const [chartContent, setChartContent] = useState<ChartContent>({
    chartData: {
      x: [],
      y: [],
      lineColor: "rgb(75, 192, 192)",
      options: defaultLinePlotOptions(
        "Wavelength (Å)",
        "Throughput",
        "Throughput",
      ),
    },
    requested: false,
  });
  const [error, setError] = useState<string | null>(null);
  const Chart = useMemo(
    () => <LinePlot chartContent={chartContent} />,
    [chartContent],
  );

  const modeConfiguration = instrumentConfiguration.modeConfiguration;
  const mode = modeConfiguration.mode;
  const filter = instrumentConfiguration.filter;

  const modeChange = (mode: InstrumentMode) => {
    switch (mode) {
      case "Imaging":
        update(
          new InstrumentConfiguration({
            modeConfiguration: new ImagingConfiguration(),
            filter,
          }),
        );
        break;
      case "Spectroscopy":
        update(
          new InstrumentConfiguration({
            modeConfiguration: new SpectroscopyConfiguration(),
            filter,
          }),
        );
        break;
      default:
        throw new Error(`Unknown instrument mode: ${mode}`);
    }
  };

  const updateParameter = (parameter: string, newValue: any) => {
    const updatedParameters: InstrumentConfigurationParameters = {
      modeConfiguration,
      filter,
      [parameter]: newValue,
    };
    update(new InstrumentConfiguration(updatedParameters));
  };

  const updatePlot = async () => {
    try {
      const throughputData = await throughput(setupData);
      setChartContent((previousChartContent) => {
        const updatedChartData = {
          x: throughputData.wavelengths,
          y: throughputData.throughputs,
          lineColor: previousChartContent.chartData.lineColor,
          options: previousChartContent.chartData.options,
        };
        setError(null);
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

  const currentMetadata = throughputFormData(setupData);
  const isPlotOutdated = !isEqual(currentMetadata, plotMetadata);

  return (
    <div>
      <div className="flex flex-col items-center md:flex-row  md:items-start">
        <div className="mr-2 ml-2 max-w-[378px] mb-3">
          <div className="bg-gray-50 p-2">
            {/* instrument mode */}
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend>Instrument Mode</legend>
              <div>
                <div className="field">
                  {/*<div className="control">*/}
                  {/*  <label className="radio">*/}
                  {/*    <input*/}
                  {/*      type="radio"*/}
                  {/*      className="mr-2"*/}
                  {/*      name="configurationOptions"*/}
                  {/*      value="imaging-mode"*/}
                  {/*      checked={mode === "Imaging"}*/}
                  {/*      onChange={() => modeChange("Imaging")}*/}
                  {/*    />*/}
                  {/*    Imaging Mode*/}
                  {/*  </label>*/}
                  {/*</div>*/}
                  <div className="control">
                    <label className="radio flex">
                      <input
                        type="radio"
                        className="mr-2"
                        name="configurationOptions"
                        value="spectroscopy-mode"
                        checked={mode === "Spectroscopy"}
                        onChange={() => modeChange("Spectroscopy")}
                      />
                      Spectroscopy&nbsp;Mode
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>
            {/* filter */}
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend>Filter</legend>
              <div>
                <div className={"field"}>
                  <select
                    className={select("w-32 control")}
                    value={filter}
                    onChange={(event) =>
                      updateParameter("filter", event.target.value)
                    }
                    name="filter"
                  >
                    <option value={"clear-filter"}>Clear Filter</option>
                    <option value={"lwbf"}>LWBF</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* imaging configuration */}
            {mode === "Imaging" && (
              <fieldset className="border border-solid border-gray-300 p-3">
                <legend> Imaging Mode</legend>
                <ImagingConfigurationPanel />
              </fieldset>
            )}

            {/* spectroscopy configuration */}
            {mode === "Spectroscopy" && (
              <fieldset className="border border-solid border-gray-300 p-3">
                <legend>Spectroscopy</legend>
                <SpectroscopyConfigurationPanel
                  spectroscopyConfiguration={
                    modeConfiguration as SpectroscopyConfiguration
                  }
                  update={(
                    spectroscopyConfiguration: SpectroscopyConfiguration,
                  ) =>
                    updateParameter(
                      "modeConfiguration",
                      spectroscopyConfiguration,
                    )
                  }
                />
              </fieldset>
            )}

            {/* update the plot */}
            <div>
              <button
                className={button(" mt-3 bg-green-600 text-white")}
                onClick={updatePlot}
              >
                Show Throughput
              </button>

              {error && <p className={"has-text-danger"}>{error}</p>}
            </div>
          </div>
        </div>

        <div className="ml-2 w-full">
          {!chartContent.requested && (
            <div>
              <p className={"hidden m-4 md:block"}>
                Press the "Show Throughput" button to generate the plots
              </p>
            </div>
          )}

          {chartContent.requested && (
            <div>
              <div className="bg-gray-50 p-2">
                <div className={!error ? "" : "bg-red-300"}>
                  <div className="chart-container">
                    {chartContent.requested && isPlotOutdated && (
                      <div className="watermark">Outdated</div>
                    )}
                    {Chart}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
