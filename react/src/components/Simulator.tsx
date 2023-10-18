import { useState } from "react";
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

interface SimulationSetupParameters {
  source: Source;
  sun: Sun;
  moon: Moon;
  earth: Earth;
  spectrumPlotOptions: SpectrumPlotOptions;
  instrumentConfiguration: InstrumentConfiguration;
}

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

  public data = () => ({
    source: this.source.data(),
    sun: this.sun.data(),
    moon: this.moon.data(),
    earth: this.earth.data(),
    spectrumPlotOptions: this.spectrumPlotOptions.data(),
    instrumentConfiguration: this.instrumentConfiguration.data(),
  });
}

export function Simulator() {
  const [activeIndex, setActiveIndex] = useState(1);

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

  const updateSetup = (property: string, value: any) => {
    setSetup((previousSetup) => ({
      ...previousSetup,
      [property]: value,
    }));
  };

  const switchToIndex = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <>
      <div className="tabs is-boxed">
        <ul>
          <li className={activeIndex === 1 ? "is-active" : undefined}>
            <a className="navbar-item" onClick={() => switchToIndex(1)}>
              Generate Spectrum
            </a>
          </li>
          <li className={activeIndex === 2 ? "is-active" : undefined}>
            <a className="navbar-item" onClick={() => switchToIndex(2)}>
              Configure NIRWALS
            </a>
          </li>
          <li className={activeIndex === 3 ? "is-active" : undefined}>
            <a className="navbar-item" onClick={() => switchToIndex(3)}>
              Make an Exposure
            </a>
          </li>
        </ul>
      </div>
      {activeIndex === 1 && (
        <SpectrumGenerationTab
          source={setup.source}
          sun={setup.sun}
          moon={setup.moon}
          earth={setup.earth}
          spectrumPlotOptions={setup.spectrumPlotOptions}
          updateSetup={updateSetup}
        />
      )}
      {activeIndex === 2 && (
        <InstrumentConfigurationPanel
          instrumentConfiguration={setup.instrumentConfiguration}
          setupData={setup.data()}
          update={(instrumentConfiguration: InstrumentConfiguration) =>
            updateSetup("instrumentConfiguration", instrumentConfiguration)
          }
        />
      )}
      {activeIndex === 3 && <Exposure />}
    </>
  );
}
