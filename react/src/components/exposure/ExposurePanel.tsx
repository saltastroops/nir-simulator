import { GainPanel } from "./gain-panel/GainPanel.tsx";
import { SamplingPanel } from "./sampling-panel/SamplingPanel.tsx";
import { SolvingTabs } from "./solve-section/SolvingTabs.tsx";

export type GainType = {
  gainType: "Faint Object" | "Bright Object" | "Custom Object";
  adu: string;
  readNoise: string;
  fullWell: string;
};
export class Gain {
  public gainType: "Faint Object" | "Bright Object" | "Custom Object" =
    "Faint Object";
  public adu = "2.04";
  public readNoise = "17";
  public fullWell = "60000";

  public constructor(gains?: GainType) {
    if (gains) {
      this.gainType = gains.gainType;
      this.adu = gains.adu;
      this.readNoise = gains.readNoise;
      this.fullWell = gains.fullWell;
    }
  }

  public get data() {
    return {
      gainType: this.gainType,
      adu: parseFloat(this.adu),
      readNoise: parseFloat(this.readNoise),
      fullWell: parseFloat(this.fullWell),
    };
  }
}

export interface SamplingType {
  numberOfSamples: string;
  samplingType: "Fowler Sampling" | "Up The Ramp Sampling";
}

export class Sampling {
  public numberOfSamples = "15";
  public samplingType: "Fowler Sampling" | "Up The Ramp Sampling" =
    "Fowler Sampling";

  public constructor(sampling?: SamplingType) {
    if (sampling) {
      this.numberOfSamples = sampling.numberOfSamples;
      this.samplingType = sampling.samplingType;
    }
  }
  public get data() {
    return {
      numberOfSamples: parseFloat(this.numberOfSamples),
      samplingType: this.samplingType,
    };
  }
}

export interface SolveSNRType {
  exposureTime: string;
  detectorIterations: string;
}

export class SolveSNR {
  public exposureTime = "3600";
  public detectorIterations = "1";

  public constructor(solve?: SolveSNRType) {
    if (solve) {
      this.exposureTime = solve.exposureTime;
      this.detectorIterations = solve.detectorIterations;
    }
  }
  public get data() {
    return {
      exposureTime: parseFloat(this.exposureTime),
      detectorIterations: parseFloat(this.detectorIterations),
    };
  }
}

export interface SolveExposureTimeType {
  requestedSNR: string;
  wavelength: string;
}

export class SolveExposureTime {
  public requestedSNR = "10";
  public wavelength = "13000";

  public constructor(solve?: SolveExposureTimeType) {
    if (solve) {
      this.requestedSNR = solve.requestedSNR;
      this.wavelength = solve.wavelength;
    }
  }
  public get data() {
    return {
      requestedSNR: parseFloat(this.requestedSNR),
      wavelength: parseFloat(this.wavelength),
    };
  }
}

export interface ExposureConfigurationType {
  solveFor: "Signal To Noise" | "Exposure Time";
  gain: GainType;
  sampling: SamplingType;
  solveSNR: SolveSNRType;
  solveExposureTime: SolveExposureTimeType;
}

export class ExposureConfiguration {
  public gain: Gain = new Gain();
  public sampling: Sampling = new Sampling();
  public solveSNR: SolveSNR = new SolveSNR();
  public solveExposureTime: SolveExposureTime = new SolveExposureTime();
  public solveFor: "Signal To Noise" | "Exposure Time" = "Signal To Noise";

  public constructor(configuration?: ExposureConfigurationType) {
    if (configuration) {
      this.solveFor = configuration.solveFor;
      this.gain = new Gain(configuration.gain);
      this.sampling = new Sampling(configuration.sampling);
      this.solveSNR = new SolveSNR(configuration.solveSNR);
      this.solveExposureTime = new SolveExposureTime(
        configuration.solveExposureTime,
      );
    }
  }

  public get data() {
    return {
      solveFor: this.solveFor,
      gain: this.gain.data,
      sampling: this.sampling.data,
      solveSNR: this.solveSNR.data,
      solveExposureTime: this.solveExposureTime.data,
    };
  }
}

export function ExposurePanel({ setupData, update }: any) {
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
                setupData={setupData.exposureConfiguration}
                update={updateExposureConfiguration}
              />
            </div>
            <div className="column is-two-fifths">
              <SamplingPanel
                setupData={setupData.exposureConfiguration}
                update={updateExposureConfiguration}
              />
            </div>
          </div>
          <div className="columns">
            <div className="column is-half">
              <SolvingTabs
                setupData={setupData}
                update={updateExposureConfiguration}
              />
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
