export type SpectrumType =
  | "Blackbody"
  | "Galaxy"
  | "Emission Line"
  | "User-Defined";

export interface Spectrum {
  spectrumType: SpectrumType;
  errors: Record<string, string>;
  data: Record<string, any>;
}

export type InstrumentMode = "Imaging" | "Spectroscopy";
