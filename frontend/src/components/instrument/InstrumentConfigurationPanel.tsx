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
import { button, select } from "../utils.ts";

type ModeConfiguration = ImagingConfiguration | SpectroscopyConfiguration;

interface InstrumentConfigurationParameters {
  modeConfiguration: ModeConfiguration;
  filter: string;
}

export class InstrumentConfiguration {
  public modeConfiguration: ModeConfiguration = new SpectroscopyConfiguration();
  public filter: string = "Clear Filter";

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

export function InstrumentConfigurationPanel({
  instrumentConfiguration,
  setupData,
  update,
}: Props) {
  const [chartContent, setChartContent] = useState<ChartContent>({
    chartData: {
      x: [],
      y: [],
      lineColor: "rgb(75, 192, 192)",
      options: defaultLinePlotOptions("Wavelength (\u212B)", "Throughput", "Throughput"),
    },
    requested: false,
  });
  const [error, setError] = useState<string | null>(null);
  const Chart = useMemo(
    () => (
      <LinePlot
        chartContent={chartContent}
        isOutdated={false && chartContent.requested}
      />
    ),
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
        return {
          chartData: updatedChartData,
          requested: true,
        };
      });
    } catch (error) {
      setError("Failed to fetch plot data.");
      console.error("Error fetching plot data:", error);
    }
  };

  return (
    <div>
      <div className="columns">
        <div className="column is-one-fifth">
          <div className="tile is-parent is-vertical notification">
            {/* instrument mode */}
            <div className="tile is-child box has-margin-top">
              <div className="field">
                <div className="control">
                  <label className="radio">
                    <input
                      type="radio"
                      className="mr-2"
                      name="configurationOptions"
                      value="imaging-mode"
                      checked={mode === "Imaging"}
                      onChange={() => modeChange("Imaging")}
                    />
                    Imaging Mode
                  </label>
                </div>
                <div className="control">
                  <label className="radio">
                    <input
                      type="radio"
                      className="mr-2"
                      name="configurationOptions"
                      value="spectroscopy-mode"
                      checked={mode === "Spectroscopy"}
                      onChange={() => modeChange("Spectroscopy")}
                    />
                    Spectroscopy Mode
                  </label>
                </div>
              </div>
            </div>

            {/* filter */}
            <div className="control pb-4">
              <label className="label">Filter</label>
              <div>
                <select
                  className={select("w-32")}
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

            {/* imaging configuration */}
            {mode === "Imaging" && <ImagingConfigurationPanel />}

            {/* spectroscopy configuration */}
            {mode === "Spectroscopy" && (
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
            )}

            {/* update the plot */}
            <div>
              <div className="tile">
                <button
                  className={button("ml-4 bg-green-600 text-white")}
                  onClick={updatePlot}
                >
                  Update Throughput
                </button>
              </div>
              {error && (
                <div className="tile">
                  <p className={"has-text-danger"}>{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="column notification">
          <div className={!error ? "tile" : "tile notification is-danger"}>
            {Chart}
          </div>
        </div>
      </div>
    </div>
  );
}
