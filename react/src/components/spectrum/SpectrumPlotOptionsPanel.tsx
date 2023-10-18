export type SpectrumPlotOptions = {
  includeAtmosphericExtinction: boolean;
  multiplyWithMirrorAreaAndEfficiency: boolean;
  calculateFluxInSeeingDisk: boolean;
};

export function makeDefaultSpectrumPlotOptions(): SpectrumPlotOptions {
  return {
    includeAtmosphericExtinction: false,
    multiplyWithMirrorAreaAndEfficiency: false,
    calculateFluxInSeeingDisk: false,
  };
}

interface Props {
  spectrumPlotOptions: SpectrumPlotOptions;
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
    update({
      ...spectrumPlotOptions,
      [option]: newValue,
    });
  };

  return (
    <div>
      {/* include atmospheric extinction? */}
      <div>
        <label>
          <input
            type="checkbox"
            value="extinction"
            checked={includeAtmosphericExtinction}
            onChange={(event) =>
              updateOption("includeAtmosphericExtinction", event.target.checked)
            }
          />
          Include atmospheric extinction
        </label>
      </div>

      {/* multiply with mirror area and efficiency */}
      <div>
        <label>
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
          Multiply with mirror area and efficiency
        </label>
      </div>

      {/* calculate flux in seeing disk */}
      <div>
        <label>
          <input
            type="checkbox"
            value="extinction"
            checked={calculateFluxInSeeingDisk}
            onChange={(event) =>
              updateOption("calculateFluxInSeeingDisk", event.target.checked)
            }
          />
          Calculate flux in seeing disk
        </label>
      </div>
    </div>
  );
}
