import { useState } from "react";
import { SpectrumGenerationTab } from "./spectrum/SpectrumGenerationTab";
import { Exposure } from "./exposure/Exposure.jsx";
import { TelescopeConfigure } from "./configure/TelescopeConfigure.jsx";
import SimulationSetupContext, {
  SimulationSetupContextValue,
} from "./SimulationSetupContext.js";
import { SimulationSetup, Spectrum, SpectrumType } from "../types.js";

function makeSpectrum(type: SpectrumType): Spectrum {
  switch (type) {
    case "Blackbody":
      return { type: "Blackbody", parameters: {}, errors: {} };
    case "Star":
      return { type: "Star", parameters: {}, errors: {} };
    case "Emission Line":
      return { type: "Emission Line", parameters: {}, errors: {} };
    default:
      throw new Error(`Cannot create spectrum of type "${type}".`);
  }
}

export function Simulator() {
  const [activeIndex, setActiveIndex] = useState(1);

  const [simulationSetup, setSimulationSetup] = useState<SimulationSetup>({
    sourceSpectrum: [],
  });

  const switchToIndex = (index: number) => {
    setActiveIndex(index);
  };

  const addToSourceSpectrum = (type: SpectrumType) => {
    setSimulationSetup((previousSetup: SimulationSetup) => {
      const updatedSourceSpectrum = [
        ...previousSetup.sourceSpectrum,
        makeSpectrum(type),
      ];
      return {
        ...previousSetup,
        sourceSpectrum: updatedSourceSpectrum,
      };
    });
  };

  const removeFromSourceSpectrum = (index) => {
    setSimulationSetup((previousSetup) => {
      const updatedSourceSpectrum = [...previousSetup.sourceSpectrum];
      updatedSourceSpectrum.splice(index, 1);
      return {
        ...previousSetup,
        sourceSpectrum: updatedSourceSpectrum,
      };
    });
  };

  const contextValue: SimulationSetupContextValue = {
    addToSourceSpectrum,
    removeFromSourceSpectrum,
  };

  return (
    <SimulationSetupContext.Provider value={contextValue}>
      <div className="tabs is-boxed">
        <ul>
          <li className={activeIndex === 1 && "is-active"}>
            <a className="navbar-item" onClick={() => switchToIndex(1)}>
              Generate Spectrum
            </a>
          </li>
          <li className={activeIndex === 2 && "is-active"}>
            <a className="navbar-item" onClick={() => switchToIndex(2)}>
              Configure NIRWALS
            </a>
          </li>
          <li className={activeIndex === 3 && "is-active"}>
            <a className="navbar-item" onClick={() => switchToIndex(3)}>
              Make an Exposure
            </a>
          </li>
        </ul>
      </div>
      {activeIndex === 1 && (
        <SpectrumGenerationTab simulationSetup={simulationSetup} />
      )}
      {activeIndex === 2 && <TelescopeConfigure />}
      {activeIndex === 3 && <Exposure />}
    </SimulationSetupContext.Provider>
  );
}
