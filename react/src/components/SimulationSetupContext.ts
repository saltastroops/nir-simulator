import { Context, createContext } from "react";
import { Spectrum, SpectrumType } from "../types";

export interface SimulationSetupContextValue {
  addToSourceSpectrum: (type: SpectrumType) => void;
  removeFromSourceSpectrum: (index: number) => void;
  updateSourceSpectrum: (index: number, spectrm: Spectrum) => void;
}

const SimulationSetupContext: Context<SimulationSetupContextValue> =
  createContext(null);

export default SimulationSetupContext;
