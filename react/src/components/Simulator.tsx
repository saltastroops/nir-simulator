import { useState } from "react";
import { SpectrumGenerationTab } from "./spectrum/SpectrumGenerationTab";
import { Exposure } from "./exposure/Exposure";
import { TelescopeConfigure } from "./configure/TelescopeConfigure";
import { SimulationSetup } from "../types";
import { Moon } from "./spectrum/MoonPanel";
import { Sun } from "./spectrum/SunPanel";
import { Earth } from "./spectrum/EarthPanel.tsx";

export function Simulator() {
  const [activeIndex, setActiveIndex] = useState(1);

  const [setup, setSetup] = useState<SimulationSetup>({
    source: { type: "Point", spectrum: [] },
    sun: new Sun(),
    moon: new Moon(),
    earth: new Earth(),
  });

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
          updateSetup={updateSetup}
        />
      )}
      {activeIndex === 2 && <TelescopeConfigure />}
      {activeIndex === 3 && <Exposure />}
    </>
  );
}
