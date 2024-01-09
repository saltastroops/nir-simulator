interface SpectrumPlotOptionsParameters {
  includeAtmosphericExtinction: boolean;
  multiplyWithMirrorAreaAndEfficiency: boolean;
  calculateFluxInSeeingDisk: boolean;
}

export class SpectrumPlotOptions {
  public includeAtmosphericExtinction = false;
  public multiplyWithMirrorAreaAndEfficiency = false;
  public calculateFluxInSeeingDisk = false;

  public constructor(parameters?: SpectrumPlotOptionsParameters) {
    if (parameters) {
      this.includeAtmosphericExtinction =
        parameters.includeAtmosphericExtinction;
      this.multiplyWithMirrorAreaAndEfficiency =
        parameters.multiplyWithMirrorAreaAndEfficiency;
      this.calculateFluxInSeeingDisk = parameters.calculateFluxInSeeingDisk;
    }
  }

  public get data() {
    return {
      includeAtmosphericExtinction: this.includeAtmosphericExtinction,
      multiplyWithMirrorAreaAndEfficiency:
        this.multiplyWithMirrorAreaAndEfficiency,
      calculateFluxInSeeingDisk: this.calculateFluxInSeeingDisk,
    };
  }
}

interface Props {
  spectrumPlotOptions: any;
  update: (spectrumPlotOptions: SpectrumPlotOptions) => void;
}

export default function SpectrumPlotOptionsPanel({
  spectrumPlotOptions,
  update,
}: Props) {
  const {
    includeAtmosphericExtinction,
    multiplyWithMirrorAreaAndEfficiency,
    calculateFluxInSeeingDisk,
  } = spectrumPlotOptions;

  const updateOption = (option: string, newValue: boolean) => {
    update(
      new SpectrumPlotOptions({
        ...spectrumPlotOptions,
        [option]: newValue,
      }),
    );
  };

  return (
    <div>
      <div className="field w-80">
        {/* include atmospheric extinction? */}
        <div className="control">
          <input
            type="checkbox"
            value="extinction"
            checked={includeAtmosphericExtinction}
            onChange={(event) =>
              updateOption("includeAtmosphericExtinction", event.target.checked)
            }
          />
          <span className="ml-2">Include atmospheric extinction</span>
        </div>

        {/* multiply with mirror area and efficiency */}
        <div className="control">
          <input
            type="checkbox"
            value="areaAndEfficiency"
            checked={multiplyWithMirrorAreaAndEfficiency}
            onChange={(event) =>
              updateOption(
                "multiplyWithMirrorAreaAndEfficiency",
                event.target.checked,
              )
            }
          />
          <span className="ml-2">Multiply with mirror area and efficiency</span>
        </div>

        {/* calculate flux in seeing disk */}
        <div className="control">
          <input
            type="checkbox"
            value="extinction"
            checked={calculateFluxInSeeingDisk}
            onChange={(event) =>
              updateOption("calculateFluxInSeeingDisk", event.target.checked)
            }
          />
          <span className="ml-2">Calculate flux in seeing disk</span>
        </div>
      </div>
    </div>
  );
}
