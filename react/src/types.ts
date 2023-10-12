export type SpectrumType = "Blackbody" | "Star" | "Emission Line";

export interface Spectrum {
  type: SpectrumType;
  parameters: object;
  errors: object;
}

export interface SimulationSetup {
  sourceSpectrum: Spectrum[];
}
