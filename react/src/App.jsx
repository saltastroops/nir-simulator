import TargetSpectrumForm from "./components/spectrum/TargetSpectrumForm.jsx";
import SimulationSetupContext from "./components/SimulationSetupContext.js";
import { useState } from "react";

function App() {
  const [simulationSetup, setSimulationSetup] = useState({
    spectrumComponents: [],
  });

  const addSpectrumComponent = (spectrumType) => {
    setSimulationSetup((previousSetup) => {
      const updatedSpectrumComponents = [
        ...previousSetup.spectrumComponents,
        spectrumType,
      ];
      return {
        ...previousSetup,
        spectrumComponents: updatedSpectrumComponents,
      };
    });
  };

  const removeSpectrumComponent = (index) => {
    setSimulationSetup((previousSetup) => {
      const updatedSpectrumComponents =
        previousSetup.spectrumComponents.toSpliced(index, 1);
      return {
        ...previousSetup,
        spectrumComponents: updatedSpectrumComponents,
      };
    });
  };

  const contextValue = {
    addSpectrumComponent,
    removeSpectrumComponent,
  };

  return (
    <SimulationSetupContext.Provider value={contextValue}>
      <TargetSpectrumForm
        spectrumComponents={simulationSetup.spectrumComponents}
      />
    </SimulationSetupContext.Provider>
  );
}

export default App;
