import { InstrumentMode } from "../../types.ts";

export class ImagingConfiguration {
  public readonly mode: InstrumentMode = "Imaging";

  public get data() {
    return {
      mode: this.mode,
    };
  }
}

export default function ImagingConfigurationPanel() {
  return <div></div>;
}
