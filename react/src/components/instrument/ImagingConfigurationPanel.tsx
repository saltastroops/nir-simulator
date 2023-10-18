import { InstrumentMode } from "../../types.ts";

export class ImagingConfiguration {
  public readonly mode: InstrumentMode = "Imaging";

  public data = () => ({
    mode: this.mode,
  });
}

export default function InstrumentConfigurationPanel() {
  return <div></div>;
}
