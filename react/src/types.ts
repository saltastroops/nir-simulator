import { Moon } from "./components/spectrum/MoonPanel.tsx";

export type SpectrumType =
  | "Blackbody"
  | "Galaxy"
  | "Emission Line"
  | "User-Defined";

export type SourceType = "Point" | "Diffuse";

export interface Spectrum {
  type: SpectrumType;
  parameters: Record<string, string | File | null>;
  errors: () => Record<string, string>;
  typedParameters: () => Record<string, any>;
}

export interface Source {
  spectrum: Spectrum[];
  type: SourceType;
}

export interface SimulationSetup {
  source: Source;
  moon: Moon;
}
