interface MoonParameters {
  zenithDistance: string;
  phase: string;
  lunarElongation: string;
}

export class Moon {
  public parameters: MoonParameters = {
    zenithDistance: "75",
    phase: "90",
    lunarElongation: "90",
  };

  public constructor(parameters?: MoonParameters) {
    if (parameters) {
      this.parameters = parameters;
    }
  }

  public errors = () => {
    const errors: Record<string, string> = {};
    const parameters = this.typedParameters();

    // zenith distance
    const zenithDistance = parameters.zenithDistance;
    const minZenithDistance = 0;
    const maxZenmithDistance = 180;
    if (
      Number.isNaN(zenithDistance) ||
      zenithDistance < minZenithDistance ||
      zenithDistance > maxZenmithDistance
    ) {
      errors.zenithDistance = `The zenith distance must be a number between ${minZenithDistance} and ${maxZenmithDistance}.`;
    }

    // phase
    const phase = parameters.phase;
    const minPhase = 0;
    const maxPhase = 180;
    if (Number.isNaN(phase) || phase < minPhase || phase > maxPhase) {
      errors.phase = `The phase must be a number between ${minPhase} and ${maxPhase}.`;
    }

    // lunar elongation
    const lunarElongation = parameters.lunarElongation;
    const minLunarElongation = 0;
    const maxLunarElongation = 180;
    if (
      Number.isNaN(lunarElongation) ||
      lunarElongation < minLunarElongation ||
      lunarElongation > maxLunarElongation
    ) {
      errors.lunarElongation = `The lunar elongation must be a number between ${minLunarElongation} and ${maxLunarElongation}.`;
    }

    return errors;
  };

  public typedParameters = () => {
    return {
      zenithDistance: parseFloat(this.parameters.zenithDistance),
      phase: parseFloat(this.parameters.phase),
      lunarElongation: parseFloat(this.parameters.lunarElongation),
    };
  };

  public hasErrors() {
    return Object.keys(this.errors()).length > 0;
  }
}

interface Props {
  moon: Moon;
  update: (moon: Moon) => void;
}

export default function MoonPanel({ moon, update }: Props) {
  const parameters = moon.parameters;
  const errors = moon.errors();

  const updateParameter = (parameter: string, newValue: string) => {
    update(
      new Moon({
        ...parameters,
        [parameter]: newValue,
      }),
    );
  };

  const selectDark = () => {
    const darkParameters: MoonParameters = {
      zenithDistance: "180",
      phase: "180",
      lunarElongation: "180",
    };
    update(new Moon(darkParameters));
  };

  const selectGrey = () => {
    const greyParameters: MoonParameters = {
      zenithDistance: "75",
      phase: "90",
      lunarElongation: "90",
    };
    update(new Moon(greyParameters));
  };

  const selectBright = () => {
    const brightParameters: MoonParameters = {
      zenithDistance: "25",
      phase: "25",
      lunarElongation: "25",
    };
    update(new Moon(brightParameters));
  };

  return (
    <div>
      <div className="flex items-center">
        {/* zenith distance */}
        <label htmlFor="lunar-zenith-distance">Moon ZD</label>
        <input
          id="lunar-zenith-distance"
          className="input w-24"
          value={parameters.zenithDistance}
          onChange={(event) =>
            updateParameter("zenithDistance", event.target.value)
          }
        />

        {/* phase */}
        <label htmlFor="lunar-phase">Lunar Phase</label>
        <input
          id="lunar-phase"
          className="input w-24"
          value={parameters.phase}
          onChange={(event) => updateParameter("phase", event.target.value)}
        />

        {/* lunar elongation */}
        <label htmlFor="lunar-elongation">Lunar Elongation</label>
        <input
          id="lunar-elongation"
          className="input w-24"
          value={parameters.lunarElongation}
          onChange={(event) =>
            updateParameter("lunarElongation", event.target.value)
          }
        />
      </div>

      {/* errors */}
      {moon.hasErrors() && (
        <div>
          {["zenithDistance", "phase", "lunarElongation"].map(
            (key) =>
              errors[key] && <div className="text-red-700">{errors[key]}</div>,
          )}
        </div>
      )}

      {/* quick select */}
      <div>
        <span className="mr-3">Quick Select:</span>
        <span className="text-sky-500 cursor-pointer mr-3" onClick={selectDark}>
          Dark Moon
        </span>
        <span className="text-sky-500 cursor-pointer mr-3" onClick={selectGrey}>
          Grey Moon
        </span>
        <span
          className="text-sky-500 cursor-pointer mr-3"
          onClick={selectBright}
        >
          Bright Moon
        </span>
      </div>
    </div>
  );
}