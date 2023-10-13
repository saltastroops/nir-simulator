export type SpectrumType = "Blackbody" | "Galaxy" | "Emission Line";

export type SourceType = "Point" | "Diffuse";

export interface Spectrum {
  type: SpectrumType;
  parameters: Record<string, any>;
  errors: Record<string, any>;
}

export interface Source {
  spectrum: Spectrum[];
  type: SourceType;
}

export interface SimulationSetup {
  source: Source;
}
