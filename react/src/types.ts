export type SpectrumType = "Blackbody" | "Galaxy" | "Emission Line";

export interface Spectrum {
  type: SpectrumType;
  parameters: object;
  errors: object;
}

export interface SimulationSetup {
  sourceSpectrum: Spectrum[];
}
