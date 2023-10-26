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

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // e/ADU
    const adu = data.adu;
    const minAdu = 1;
    const maxAdu = 7;
    if (Number.isNaN(adu) || adu < minAdu || adu > maxAdu) {
      errors.adu = `The electron/ADU must be a number between ${minAdu} and ${maxAdu}.`;
    }

    // Read Noise
    const readNoise = data.readNoise;
    const minReadNoise = 10;
    const maxReadNoise = 30;
    if (
      Number.isNaN(readNoise) ||
      readNoise < minReadNoise ||
      readNoise > maxReadNoise
    ) {
      errors.readNoise = `The read noise must be a number between ${minReadNoise} and ${maxReadNoise}.`;
    }

    // Full well
    const fullWell = data.readNoise;
    const minFullWell = 50000;
    const maxFullWell = 130000;
    if (
      Number.isNaN(fullWell) ||
      fullWell < minFullWell ||
      readNoise > maxFullWell
    ) {
      errors.fullWell = `The full well must be a number between ${minFullWell} and ${maxFullWell}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
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

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // Number of samples
    const numberOfSamples = data.numberOfSamples;
    const minNumberOfSamples = 1;
    const maxNumberOfSamples = 10000;
    if (
      Number.isNaN(numberOfSamples) ||
      numberOfSamples < minNumberOfSamples ||
      numberOfSamples > maxNumberOfSamples
    ) {
      errors.numberOfSamples = `The number of samples must be a number between ${minNumberOfSamples} and ${maxNumberOfSamples}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
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

  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // Detector Iterations
    const detectorIterations = data.detectorIterations;
    const minDetectorIterations = 1;
    const maxDetectorIterations = 1000;
    if (
      Number.isNaN(detectorIterations) ||
      detectorIterations < minDetectorIterations ||
      detectorIterations > maxDetectorIterations
    ) {
      errors.detectorIterations = `The detector iterations must be a number between ${minDetectorIterations} and ${maxDetectorIterations}.`;
    }

    // Exposure Time
    const exposureTime = data.exposureTime;
    const minExposureTime = 1;
    const maxExposureTime = 1000;
    if (
      Number.isNaN(exposureTime) ||
      exposureTime < minExposureTime ||
      exposureTime > maxExposureTime
    ) {
      errors.exposureTime = `The detector iterations must be a number between ${minExposureTime} and ${maxExposureTime}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
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
  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // Detector Iterations
    const wavelength = data.wavelength;
    const minWavelength = 9000;
    const maxWavelength = 17000;
    if (
      Number.isNaN(wavelength) ||
      wavelength < minWavelength ||
      wavelength > maxWavelength
    ) {
      errors.wavelength = `The wavelength must be a number between ${minWavelength} and ${maxWavelength}.`;
    }

    // Exposure Time
    const requestedSNR = data.requestedSNR;
    const minRequestedSNR = 1;
    const maxRequestedSNR = 1000;
    if (
      Number.isNaN(requestedSNR) ||
      requestedSNR < minRequestedSNR ||
      requestedSNR > maxRequestedSNR
    ) {
      errors.requestedSNR = `The requested signal to noise must be a number between ${minRequestedSNR} and ${maxRequestedSNR}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
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
  const [chartContent, setChartContent] = useState<ChartContent>({
    chartData: {
      x: [],
      y: [],
      lineColor: "rgb(75, 192, 192)",
      options: defaultLinePlotOptions("Wavelength (\u212B)", "Throughput"),
    },
    requested: false,
  });

  const updatePlot = () => {
    // const formData = new FormData();
    fetch(environment.apiUrl + "/solve/", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Opps, Something went wrong.");
        }
        return response.json();
      })
      .then((data) => {
        setChartContent((previousChartContent) => {
          const updatedChartData = {
            x: data.x,
            y: data.y,
            lineColor: previousChartContent.chartData.lineColor,
            options: previousChartContent.chartData.options,
          };
          return {
            chartData: updatedChartData,
            requested: true,
          };
        });
      })
      .catch((err) => {
        console.error("Error fetching plot data:", err);
      });
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
          <LinePlot chartContent={chartContent} isOutdated={false} />
          <button onClick={() => updatePlot()}>Update</button>
        </div>
      </div>
    </div>
  );
}

import { LinePlot } from "../plots/LinePlot.tsx";
import { useState } from "react";
import { defaultLinePlotOptions } from "../plots/PlotOptions.ts";
import { ChartContent } from "../instrument/InstrumentConfigurationPanel.tsx";
import { environment } from "../../environments/environment.ts";
