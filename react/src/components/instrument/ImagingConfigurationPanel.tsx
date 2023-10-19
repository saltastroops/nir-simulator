import { InstrumentMode } from "../../types.ts";

export class ImagingConfiguration {
  public readonly mode: InstrumentMode = "Imaging";

  public constructor() {
    this.data = this.data.bind(this);
  }

  public data() {
    return {
      mode: this.mode,
    };
  }
}

export default function ImagingConfigurationPanel() {
  return <div></div>;
}
