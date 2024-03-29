import { Gain, GainDataType, GainPanel } from "./gain-panel/GainPanel.tsx";
import {
  Sampling,
  SamplingDataType,
  SamplingPanel,
} from "./sampling-panel/SamplingPanel.tsx";
import { QueryTabs } from "./query-panel/QueryTabs.tsx";
import {
  ExposureTime,
  ExposureTimeDataType,
} from "./query-panel/SNRQueryTab.tsx";
import { SNR, SNRDataType } from "./query-panel/ExposureTimeQueryTab.tsx";
import { SimulationSetup } from "../Simulator.tsx";
import { useMemo, useState } from "react";
import { defaultLinePlotOptions, LineOptions } from "../plots/PlotOptions.ts";
import { exposure } from "../../services.ts";
import { AdditionalPlot, ExposurePlot } from "../plots/ExposurePlot.tsx";
import { exposureFormData } from "../utils.ts";
import { isEqual } from "lodash";

interface ExposureConfigurationParameters {
  gain: Gain;
  sampling: Sampling;
  exposureTime: ExposureTime;
  snr: SNR;
  activeQuery: "SNR" | "ExposureTime";
}

type ExposureConfigurationData = {
  gain: GainDataType;
  sampling: SamplingDataType;
  exposureTime?: ExposureTimeDataType;
  snr?: SNRDataType;
};

export interface ExposureChartContent {
  targetElectrons: {
    x: number[];
    y: number[];
    lineColor: string;
    options: LineOptions;
  };
  additionalPlot: {
    x: number[];
    y: number[];
    lineColor: string;
    options: LineOptions;
  };
  requested: boolean;
}

export function defaultAdditionalPlotOptions(
  xLabel: string,
  yLabel: string,
  title: string,
): LineOptions {
  return {
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: xLabel,
        },
        ticks: {
          min: 8000,
          max: 18000,
          stepSize: 1000,
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: yLabel,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
  };
}

export class ExposureConfiguration {
  public gain: Gain = new Gain();
  public sampling: Sampling = new Sampling();
  public exposureTime: ExposureTime = new ExposureTime();
  public snr: SNR = new SNR();
  public activeQuery: "SNR" | "ExposureTime" = "SNR";

  public constructor(configuration?: ExposureConfigurationParameters) {
    if (configuration) {
      this.gain = new Gain(configuration.gain);
      this.sampling = new Sampling(configuration.sampling);
      this.exposureTime = new ExposureTime(configuration.exposureTime);
      this.snr = new SNR(configuration.snr);
      this.activeQuery = configuration.activeQuery;
    }
  }

  public get data() {
    let data: ExposureConfigurationData = {
      gain: this.gain.data,
      sampling: this.sampling.data,
    };

    if (this.activeQuery === "SNR") {
      data.exposureTime = this.exposureTime.data;
    }
    if (this.activeQuery === "ExposureTime") {
      data.snr = this.snr.data;
    }

    return data;
  }
}

interface Props {
  setup: SimulationSetup;
  update: (params: ExposureConfiguration) => void;
}

export function ExposureTab({ setup, update }: Props) {
  const updateExposureConfiguration = (
    newExposureConfiguration: ExposureConfigurationParameters,
  ) => {
    update(new ExposureConfiguration(newExposureConfiguration));
  };
  const [chartContent, setChartContent] = useState<ExposureChartContent>({
    targetElectrons: {
      x: [],
      y: [],
      lineColor: "rgb(75, 192, 192)",
      options: defaultLinePlotOptions(
        "Wavelength (Å)",
        "Count",
        "Electron Count (in spectral bin)",
      ),
    },
    additionalPlot: {
      x: [],
      y: [],
      lineColor: "rgb(75, 192, 192)",
      options: defaultLinePlotOptions("", "", ""),
    },
    requested: false,
  });
  const Chart = useMemo(
    () => <ExposurePlot chartContent={chartContent} />,
    [chartContent],
  );
  const [error, setError] = useState<string | null>(null);

  const [plotMetadata, setPlotMetadata] = useState({} as any);
  const currentMetadata = exposureFormData(setup);
  const isPlotOutdated = !isEqual(currentMetadata, plotMetadata);

  const AdditionalChart = useMemo(
    () => <AdditionalPlot chartContent={chartContent} />,
    [chartContent],
  );

  const updatePlots = async () => {
    try {
      const exposureData = await exposure(setup);
      const data = exposureData.target_electrons;
      const isSNRRequested = exposureData.snr !== undefined;
      const additionalData = isSNRRequested
        ? { x: exposureData.snr.wavelengths, y: exposureData.snr.snr_values }
        : {
            x: exposureData.exposure_time.exposure_times,
            y: exposureData.exposure_time.snr_values,
          };
      const additionalOptions = isSNRRequested
        ? {
            title: "SNR (in spectral bin)",
            xLabel: "Wavelength (Å)",
            yLabel: "SNR",
          }
        : {
            title: "SNR (in spectral bin)",
            xLabel: "Exposure Time (sec)",
            yLabel: "SNR",
          };

      setPlotMetadata(currentMetadata);

      setChartContent((previousChartContent: ExposureChartContent) => {
        const updatedTargetElectronsData = {
          x: data.wavelengths,
          y: data.counts,
          lineColor: previousChartContent.targetElectrons.lineColor,
          options: previousChartContent.targetElectrons.options,
        };
        const updatedAdditionalPlotData = {
          x: additionalData.x,
          y: additionalData.y,
          lineColor: previousChartContent.targetElectrons.lineColor,
          options: defaultAdditionalPlotOptions(
            additionalOptions.xLabel,
            additionalOptions.yLabel,
            additionalOptions.title,
          ),
        };
        setError(null);
        return {
          targetElectrons: updatedTargetElectronsData,
          additionalPlot: updatedAdditionalPlotData,
          requested: true,
        };
      });
    } catch (error) {
      setError("Data request failed.");
      console.error("Error fetching plot data:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center md:flex-row md:items-start">
        {/* Controls Section */}
        <div className="mr-2 ml-2 max-w-[378px] mb-3">
          <div className="bg-gray-50 p-2">
            <fieldset className="border border-solid border-gray-300 p-3 mb-4">
              <legend>Gain</legend>
              <GainPanel
                exposureConfiguration={setup.exposureConfiguration}
                update={updateExposureConfiguration}
              />
            </fieldset>

            <fieldset className="border border-solid border-gray-300 p-3 mb-4">
              <legend>Sampling</legend>
              <SamplingPanel
                exposureConfiguration={setup.exposureConfiguration}
                update={updateExposureConfiguration}
              />
            </fieldset>

            <fieldset className="border border-solid border-gray-300 p-3">
              <legend>Query</legend>
              <QueryTabs
                exposureConfiguration={setup.exposureConfiguration}
                update={updateExposureConfiguration}
                updatePlots={updatePlots}
              />
              {error && <p className={"has-text-danger"}>{error}</p>}
            </fieldset>
          </div>
        </div>
        {/* Plot Section */}
        <div className="ml-2 w-full">
          {!chartContent.requested && (
            <div>
              {setup.exposureConfiguration.activeQuery === "SNR" && (
                <p className={"hidden m-4 md:block"}>
                  Press the "Show Signal to Noise" button to generate the plots
                </p>
              )}
              {setup.exposureConfiguration.activeQuery === "ExposureTime" && (
                <p className={"hidden m-4 md:block"}>
                  Press the "Show Exposure Time" button to generate the plots
                </p>
              )}
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
              <div className="bg-gray-50 mt-2 p-2">
                <div className={!error ? "" : "bg-red-300"}>
                  <div className="chart-container">
                    {chartContent.requested && isPlotOutdated && (
                      <div className="watermark">Outdated</div>
                    )}
                    {AdditionalChart}
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
