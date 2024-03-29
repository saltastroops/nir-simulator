import { useRef, useState } from "react";
import { SpectrumGenerationTab } from "./spectrum/SpectrumGenerationTab";
import { ExposureConfiguration, ExposureTab } from "./exposure/ExposureTab.tsx";
import {
  InstrumentConfiguration,
  InstrumentConfigurationTab,
} from "./instrument/InstrumentConfigurationTab.tsx";
import { Moon } from "./spectrum/MoonPanel";
import { Sun } from "./spectrum/SunPanel";
import { Earth } from "./spectrum/EarthPanel.tsx";
import { SpectrumPlotOptions } from "./spectrum/SpectrumPlotOptionsPanel.tsx";
import { Source } from "./spectrum/SourceForm.tsx";

type SimulationSetupParameters = {
  source: Source;
  sun: Sun;
  moon: Moon;
  earth: Earth;
  spectrumPlotOptions: SpectrumPlotOptions;
  instrumentConfiguration: InstrumentConfiguration;
  exposureConfiguration: ExposureConfiguration;
};

export type SimulationSetupData = Record<keyof SimulationSetup, any>;

export class SimulationSetup {
  public source: Source = new Source();
  public sun: Sun = new Sun();
  public moon: Moon = new Moon();
  public earth: Earth = new Earth();
  public spectrumPlotOptions: SpectrumPlotOptions = new SpectrumPlotOptions();
  public instrumentConfiguration: InstrumentConfiguration =
    new InstrumentConfiguration();
  public exposureConfiguration: ExposureConfiguration =
    new ExposureConfiguration();

  public constructor(parameters?: SimulationSetupParameters) {
    if (parameters) {
      this.source = parameters.source;
      this.sun = parameters.sun;
      this.moon = parameters.moon;
      this.earth = parameters.earth;
      this.spectrumPlotOptions = parameters.spectrumPlotOptions;
      this.instrumentConfiguration = parameters.instrumentConfiguration;
      this.exposureConfiguration = parameters.exposureConfiguration;
    }
  }

  public get data() {
    return {
      source: this.source.data,
      sun: this.sun.data,
      moon: this.moon.data,
      earth: this.earth.data,
      spectrumPlotOptions: this.spectrumPlotOptions.data,
      instrumentConfiguration: this.instrumentConfiguration.data,
      exposureConfiguration: this.exposureConfiguration.data,
    };
  }
}

export function Simulator() {
  const [setup, setSetup] = useState<SimulationSetup>(
    new SimulationSetup({
      source: new Source(),
      sun: new Sun(),
      moon: new Moon(),
      earth: new Earth(),
      spectrumPlotOptions: new SpectrumPlotOptions(),
      instrumentConfiguration: new InstrumentConfiguration(),
      exposureConfiguration: new ExposureConfiguration(),
    }),
  );

  const spectrumLIRef = useRef<HTMLLIElement>(null);
  const instrumentConfigLIRef = useRef<HTMLLIElement>(null);
  const exposureLIRef = useRef<HTMLLIElement>(null);

  const spectrumDivRef = useRef<HTMLDivElement>(null);
  const instrumentConfigDivRef = useRef<HTMLDivElement>(null);
  const exposureDivRef = useRef<HTMLDivElement>(null);

  const updateSetup = (property: string, value: any) => {
    setSetup(
      (previousSetup) =>
        new SimulationSetup({
          ...previousSetup,
          [property]: value,
        }),
    );
  };

  const switchToIndex = (index: number) => {
    // update tab highlighting
    spectrumLIRef.current!.classList.remove("is-active");
    instrumentConfigLIRef.current!.classList.remove("is-active");
    exposureLIRef.current!.classList.remove("is-active");
    if (index === 1) {
      spectrumLIRef.current!.classList.add("is-active");
    }
    if (index === 2) {
      instrumentConfigLIRef.current!.classList.add("is-active");
    }
    if (index === 3) {
      exposureLIRef.current!.classList.add("is-active");
    }

    spectrumDivRef.current!.style.display = index === 1 ? "block" : "none";
    instrumentConfigDivRef.current!.style.display =
      index === 2 ? "block" : "none";
    exposureDivRef.current!.style.display = index === 3 ? "block" : "none";
  };

  return (
    <div className="text-md">
      <div className="mt-4 mb-4 p-4 border border-orange-300 bg-yellow-50 text-orange-300 font-semibold">
        The NIRWALS Simulator is still under development, and you may expect
        significant changes over the next weeks. Please send bug reports,
        suggestions etc. to salthelp (at) salt.ac.za.
      </div>
      <div className="tabs">
        <ul>
          <li className="is-active" ref={spectrumLIRef}>
            <a onClick={() => switchToIndex(1)}>Generate Spectrum</a>
          </li>
          <li ref={instrumentConfigLIRef}>
            <a onClick={() => switchToIndex(2)}>Configure NIRWALS</a>
          </li>
          <li ref={exposureLIRef}>
            <a onClick={() => switchToIndex(3)}>Make an Exposure</a>
          </li>
          <li>
            <a href="https://simulator.salt.ac.za/docs/" target="_blank">
              Documentation
            </a>
          </li>
        </ul>
      </div>

      <div ref={spectrumDivRef} style={{ display: "block" }}>
        <SpectrumGenerationTab setup={setup} updateSetup={updateSetup} />
      </div>
      <div ref={instrumentConfigDivRef} style={{ display: "none" }}>
        <InstrumentConfigurationTab
          instrumentConfiguration={setup.instrumentConfiguration}
          setupData={setup}
          update={(instrumentConfiguration: InstrumentConfiguration) =>
            updateSetup("instrumentConfiguration", instrumentConfiguration)
          }
        />
      </div>
      <div ref={exposureDivRef} style={{ display: "none" }}>
        <ExposureTab
          setup={setup}
          update={(exposureConfiguration: ExposureConfiguration) =>
            updateSetup("exposureConfiguration", exposureConfiguration)
          }
        />
      </div>
    </div>
  );
}
