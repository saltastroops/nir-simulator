export type SpectrumType =
  | "Blackbody"
  | "Galaxy"
  | "Emission Line"
  | "User-Defined";

export interface Spectrum {
  type: SpectrumType;
  parameters: Record<string, string | File | null>;
  errors: () => Record<string, string>;
  data: () => Record<string, any>;
}

export type InstrumentMode = "Imaging" | "Spectroscopy";
