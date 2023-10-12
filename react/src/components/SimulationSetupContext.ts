import { Context, createContext } from "react";

interface SimulationSetupContextValue {
  addSpectrumComponent: (any) => void;
  removeSpectrumComponent: (index: number) => void;
}

const SimulationSetupContext: Context<SimulationSetupContextValue> =
  createContext(null);

export default SimulationSetupContext;
