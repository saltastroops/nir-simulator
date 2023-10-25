import { useRef, useState } from "react";
import { SpectrumGenerationTab } from "./spectrum/SpectrumGenerationTab";
import { Exposure } from "./exposure/Exposure";
import {
  InstrumentConfiguration,
  InstrumentConfigurationPanel,
} from "./instrument/InstrumentConfigurationPanel.tsx";
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

  public constructor(parameters?: SimulationSetupParameters) {
    if (parameters) {
      this.source = parameters.source;
      this.sun = parameters.sun;
      this.moon = parameters.moon;
      this.earth = parameters.earth;
      this.spectrumPlotOptions = parameters.spectrumPlotOptions;
      this.instrumentConfiguration = parameters.instrumentConfiguration;
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
    }),
  );

  const spectrumARef = useRef<HTMLAnchorElement>(null);
  const instrumentConfigARef = useRef<HTMLAnchorElement>(null);
  const exposureARef = useRef<HTMLAnchorElement>(null);

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
    spectrumARef.current!.classList.remove(...isActive);
    instrumentConfigARef.current!.classList.remove(...isActive);
    exposureARef.current!.classList.remove(...isActive);
    if (index === 1) {
      spectrumARef.current!.classList.add(...isActive);
    }
    if (index === 2) {
      instrumentConfigARef.current!.classList.add(...isActive);
    }
    if (index === 3) {
      exposureARef.current!.classList.add(...isActive);
    }

    spectrumDivRef.current!.style.display = index === 1 ? "block" : "none";
    instrumentConfigDivRef.current!.style.display =
      index === 2 ? "block" : "none";
    exposureDivRef.current!.style.display = index === 3 ? "block" : "none";
  };

  const isActive = [
    "pb-2",
    "border-b-2",
    "border-blue-700",
    "text-blue-700",
    "hover:text-blue-700",
  ];

  return (
    <div className="text-md">
      <div className="mb-8">
        <ul className="flex items-top mt-2 mb-4">
          <li className="mx-4">
            <a
              ref={spectrumARef}
              className={`${isActive.join(" ")}`}
              onClick={() => switchToIndex(1)}
            >
              Generate Spectrum
            </a>
          </li>
          <li className="mx-4">
            <a ref={instrumentConfigARef} onClick={() => switchToIndex(2)}>
              Configure NIRWALS
            </a>
          </li>
          <li className="mx-4">
            <a ref={exposureARef} onClick={() => switchToIndex(3)}>
              Make an Exposure
            </a>
          </li>
        </ul>
      </div>
      <div ref={spectrumDivRef} style={{ display: "block" }}>
        <SpectrumGenerationTab setup={setup} updateSetup={updateSetup} />
      </div>
      <div ref={instrumentConfigDivRef} style={{ display: "none" }}>
        <InstrumentConfigurationPanel
          instrumentConfiguration={setup.instrumentConfiguration}
          setupData={setup.data}
          update={(instrumentConfiguration: InstrumentConfiguration) =>
            updateSetup("instrumentConfiguration", instrumentConfiguration)
          }
        />
      </div>
      <div ref={exposureDivRef} style={{ display: "none" }}>
        <Exposure />
      </div>
    </div>
  );
}
