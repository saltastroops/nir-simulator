import { Context, createContext } from "react";
import { SpectrumType } from "../types";

export interface SimulationSetupContextValue {
  addToSourceSpectrum: (type: SpectrumType) => void;
  removeFromSourceSpectrum: (index: number) => void;
}

const SimulationSetupContext: Context<SimulationSetupContextValue> =
  createContext(null);

export default SimulationSetupContext;
