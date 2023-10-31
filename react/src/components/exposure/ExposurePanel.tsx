import { Gain, GainPanel } from "./gain-panel/GainPanel.tsx";
import { Sampling, SamplingPanel } from "./sampling-panel/SamplingPanel.tsx";
import { QueryTabs } from "./query-panel/QueryTabs.tsx";
import { ExposureTime } from "./query-panel/SNRTab.tsx";
import { SNR } from "./query-panel/ExposureTimeTab.tsx";
import { SimulationSetup } from "../Simulator.tsx";

interface ExposureConfigurationParameters {
  gain: Gain;
  sampling: Sampling;
  exposureTime: ExposureTime;
  snr: SNR;
}

export class ExposureConfiguration {
  public gain: Gain = new Gain();
  public sampling: Sampling = new Sampling();
  public exposureTime: ExposureTime = new ExposureTime();
  public snr: SNR = new SNR();

  public constructor(configuration?: ExposureConfigurationParameters) {
    if (configuration) {
      this.gain = new Gain(configuration.gain);
      this.sampling = new Sampling(configuration.sampling);
      this.exposureTime = new ExposureTime(configuration.exposureTime);
      this.snr = new SNR(configuration.snr);
    }
  }

  public get data() {
    return {
      gain: this.gain.data,
      sampling: this.sampling.data,
      exposureTime: this.exposureTime.data,
      snr: this.snr.data,
    };
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

  return (
    <div>
      <h1 className="title is-1">Make An Exposure</h1>
      <div className="columns">
        {/* Controls Section */}
        <div className="column is-two-fifths">
          <div className="columns">
            <div className="column pr-0">
              <GainPanel
                setupData={setup.exposureConfiguration}
                update={updateExposureConfiguration}
              />
            </div>
            <div className="column is-two-fifths">
              <SamplingPanel
                setupData={setup.exposureConfiguration}
                update={updateExposureConfiguration}
              />
            </div>
          </div>
          <div className="columns">
            <div className="column is-half">
              <QueryTabs
                setupData={setup.exposureConfiguration}
                update={updateExposureConfiguration}
              />
            </div>
          </div>
          <div className="columns">
            <div className="column"></div>
          </div>
        </div>
        {/* Plot Section */}
        <div className="column is-three-fifths">
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
