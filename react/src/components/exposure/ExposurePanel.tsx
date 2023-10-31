import { Gain, GainPanel } from "./gain-panel/GainPanel.tsx";
import { Sampling, SamplingPanel } from "./sampling-panel/SamplingPanel.tsx";
import { QueryTabs } from "./solve-section/QueryTabs.tsx";
import { SNRQuery, ExposureTimeType } from "./solve-section/SolveForSNR.tsx";
import {
  ExposureTimeQuery,
  SNRType,
} from "./solve-section/SolveForExposureTime.tsx";
import { SimulationSetup } from "../Simulator.tsx";

export interface ExposureConfigurationType {
  gain: Gain;
  sampling: Sampling;
  solveSNR: ExposureTimeType;
  solveExposureTime: SNRType;
}

export class ExposureConfiguration {
  public gain: Gain = new Gain();
  public sampling: Sampling = new Sampling();
  public solveSNR: SNRQuery = new SNRQuery();
  public solveExposureTime: ExposureTimeQuery = new ExposureTimeQuery();

  public constructor(configuration?: ExposureConfigurationType) {
    if (configuration) {
      this.gain = new Gain(configuration.gain);
      this.sampling = new Sampling(configuration.sampling);
      this.solveSNR = new SNRQuery(configuration.solveSNR);
      this.solveExposureTime = new ExposureTimeQuery(
        configuration.solveExposureTime,
      );
    }
  }

  public get data() {
    return {
      gain: this.gain.data,
      sampling: this.sampling.data,
      solveSNR: this.solveSNR.data,
      solveExposureTime: this.solveExposureTime.data,
    };
  }
}

interface Props {
  setup: SimulationSetup;
  update: (params: ExposureConfigurationType) => void;
}
export function ExposurePanel({ setup, update }: Props) {
  const updateExposureConfiguration = (
    newExposureConfiguration: ExposureConfigurationType,
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
              <QueryTabs setup={setup} update={updateExposureConfiguration} />
            </div>
          </div>
          <div className="columns">
            <div className="column">Status Section</div>
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
