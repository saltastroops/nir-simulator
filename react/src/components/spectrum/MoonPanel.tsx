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
    this.data.bind(this);
    this.errors.bind(this);
    this.hasErrors.bind(this);
  }

  public errors() {
    const errors: Record<string, string> = {};
    const data = this.data();

    // zenith distance
    const zenithDistance = data.zenithDistance;
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
    const phase = data.phase;
    const minPhase = 0;
    const maxPhase = 180;
    if (Number.isNaN(phase) || phase < minPhase || phase > maxPhase) {
      errors.phase = `The phase must be a number between ${minPhase} and ${maxPhase}.`;
    }

    // lunar elongation
    const lunarElongation = data.lunarElongation;
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
  }

  public data() {
    return {
      zenithDistance: parseFloat(this.parameters.zenithDistance),
      phase: parseFloat(this.parameters.phase),
      lunarElongation: parseFloat(this.parameters.lunarElongation),
    };
  }

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

  const updateMoon = (
    zenithDistance: string,
    phase: string,
    lunarElongation: string,
  ) => {
    let updatedMoon = new Moon({ zenithDistance, phase, lunarElongation });
    update(updatedMoon);
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
              errors[key] && (
                <div key={key} className="text-red-700">
                  {errors[key]}
                </div>
              ),
          )}
        </div>
      )}

      {/* quick select */}
      <div>
        <span className="mr-3">Quick Select:</span>
        <span
          className="text-sky-500 cursor-pointer mr-3"
          onClick={() => updateMoon("180", "180", "180")}
        >
          Dark Moon
        </span>
        <span
          className="text-sky-500 cursor-pointer mr-3"
          onClick={() => updateMoon("75", "90", "90")}
        >
          Grey Moon
        </span>
        <span
          className="text-sky-500 cursor-pointer mr-3"
          onClick={() => updateMoon("25", "25", "25")}
        >
          Bright Moon
        </span>
      </div>
    </div>
  );
}
