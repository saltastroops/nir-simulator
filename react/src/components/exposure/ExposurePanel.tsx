import { useMemo, useState } from "react";
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
import { exposure } from "../../services.ts";
import { defaultLinePlotOptions, LineOptions } from "../plots/PlotOptions.ts";
import { AdditionalPlot, ExposurePlot } from "../plots/ExposurePlots.tsx";

interface ExposureConfigurationParameters {
  gain: Gain;
  sampling: Sampling;
  exposureTime: ExposureTime;
  snr: SNR;
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
    }
  }

  public get data() {
    let data: ExposureConfigurationData = {
      gain: this.gain.data,
      sampling: this.sampling.data,
    };

    if (this.activeQuery === "SNR") {
      data.snr = this.snr.data;
    }
    if (this.activeQuery === "ExposureTime") {
      data.exposureTime = this.exposureTime.data;
    }

    return data;
  }
}

interface Props {
  setup: SimulationSetup;
  update: (params: ExposureConfiguration) => void;
}

export function ExposurePanel({ setup, update }: Props) {
  const updateExposureConfiguration = (
    newExposureConfiguration: ExposureConfigurationParameters,
  ) => {
    update(new ExposureConfiguration(newExposureConfiguration));
  };

  const [error, setError] = useState<string | null>(null);

  const [chartContent, setChartContent] = useState<ExposureChartContent>({
    targetElectrons: {
      x: [],
      y: [],
      lineColor: "rgb(75, 192, 192)",
      options: defaultLinePlotOptions(
        "Wavelength (\u212B)",
        "Counts(e-)",
        "Target Electrons",
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

  const AdditionalChart = useMemo(
    () => <AdditionalPlot chartContent={chartContent} />,
    [chartContent],
  );

  const updatePlots = async () => {
    try {
      const exposureData = await exposure(setup);
      const data = exposureData.plots[0];
      const additional_data = exposureData.plots[1];

      setChartContent((previousChartContent: ExposureChartContent) => {
        const updatedTargetElectronsData = {
          x: data.x.values,
          y: data.y.values,
          lineColor: previousChartContent.targetElectrons.lineColor,
          options: defaultAdditionalPlotOptions(
            data.x.label,
            data.y.label,
            data.title,
          ),
        };
        const updatedAdditionalPlotData = {
          x: additional_data.x.values,
          y: additional_data.y.values,
          lineColor: previousChartContent.targetElectrons.lineColor,
          options: defaultAdditionalPlotOptions(
            additional_data.x.label,
            additional_data.y.label,
            additional_data.title,
          ),
        };
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
      <h1 className="title is-1">Make An Exposure</h1>
      <div className="columns">
        {/* Controls Section */}
        <div className="column is-one-quarter">
          <div className="notification m-2">
            <GainPanel
              exposureConfiguration={setup.exposureConfiguration}
              update={updateExposureConfiguration}
            />
          </div>
          <div className="notification m-2">
            <SamplingPanel
              exposureConfiguration={setup.exposureConfiguration}
              update={updateExposureConfiguration}
            />
          </div>
          <div className={"bg-gray-100 p-4 m-2 mt-7"}>
            <QueryTabs
              exposureConfiguration={setup.exposureConfiguration}
              update={updateExposureConfiguration}
              updatePlots={updatePlots}
            />
          </div>
        </div>
        {/* Plot Section */}
        <div className="column">
          <div className={!error ? "tile" : "tile notification is-danger"}>
            <div className="chart-container">
              {/*{chartContent.requested && (*/}
              {/*  <div className="watermark">Outdated</div>*/}
              {/*)}*/}
              {Chart}
            </div>
          </div>
          <div className={!error ? "tile" : "tile notification is-danger"}>
            <div className="chart-container">
              {/*{chartContent.requested && (*/}
              {/*    <div className="watermark">Outdated</div>*/}
              {/*)}*/}
              {AdditionalChart}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
