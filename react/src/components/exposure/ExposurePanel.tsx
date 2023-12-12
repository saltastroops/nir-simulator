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
import {useState} from "react";
import {exposure} from "../../services.ts";

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

  const updatePlots = async () => {
    try {
      const exposureData = await exposure(setup);
      console.log(exposureData);
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
          {/*<div className="field chart-contain">*/}
          {/*  <LinePlot*/}
          {/*    chartContent={chartData}*/}
          {/*    isOutdated={page.isOutdated && page.requested}*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div className="field chart-contain">*/}
          {/*  <LinePlot*/}
          {/*    chartContent={chartData}*/}
          {/*    isOutdated={page.isOutdated && page.requested}*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
}
