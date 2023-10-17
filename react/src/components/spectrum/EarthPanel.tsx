interface EarthParameters {
  targetZenithDistance: string;
  mirrorArea: string;
  seeing: string;
}

export class Earth {
  public parameters: EarthParameters = {
    targetZenithDistance: "37",
    mirrorArea: "460000",
    seeing: "2.1",
  };

  public constructor(parameters?: EarthParameters) {
    if (parameters) {
      this.parameters = parameters;
    }
  }

  public errors = () => {
    const parameters = this.typedParameters();
    const errors: Record<string, string> = {};

    // target zenith distance
    const targetZenithDistance = parameters.targetZenithDistance;
    const minTargetZenithDistance = 31;
    const maxTargetZenithDistance = 43;
    if (
      Number.isNaN(targetZenithDistance) ||
      targetZenithDistance < minTargetZenithDistance ||
      targetZenithDistance > maxTargetZenithDistance
    ) {
      errors.targetZenithDistance = `The target zenith distance must be a value between ${minTargetZenithDistance} and ${maxTargetZenithDistance}.`;
    }

    // mirror area
    const mirrorArea = parameters.mirrorArea;
    const minMirrorArea = 0;
    const maxMirrorArea = 550000;
    if (
      Number.isNaN(mirrorArea) ||
      mirrorArea < minMirrorArea ||
      mirrorArea > maxMirrorArea
    ) {
      errors.mirrorArea = `The effective mirror area must be a number between ${minMirrorArea} and ${maxMirrorArea}.`;
    }

    // seeing
    const seeing = parameters.seeing;
    const minSeeing = 0.5;
    const maxSeeing = 5;
    if (Number.isNaN(seeing) || seeing < minSeeing || seeing > maxSeeing) {
      errors.seeing = `The seeing must be a number between ${minSeeing} and ${maxSeeing}.`;
    }

    return errors;
  };

  public typedParameters = () => {
    return {
      targetZenithDistance: parseFloat(this.parameters.targetZenithDistance),
      mirrorArea: parseFloat(this.parameters.mirrorArea),
      seeing: parseFloat(this.parameters.seeing),
    };
  };

  public hasErrors = () => {
    return Object.keys(this.errors()).length > 0;
  };
}

interface Props {
  earth: Earth;
  update: (earth: Earth) => void;
}

export function EarthPanel({ earth, update }: Props) {
  const parameters = earth.parameters;
  const errors = earth.errors();

  const updateParameter = (parameter: string, newValue: string) => {
    update(
      new Earth({
        ...parameters,
        [parameter]: newValue,
      }),
    );
  };

  return (
    <div>
      <div className="flex items-center">
        {/* target zenith distance */}
        <label htmlFor="obsercvation-year">Target ZD</label>
        <input
          id="observation-year"
          className="input w-24"
          value={parameters.targetZenithDistance}
          onChange={(event) =>
            updateParameter("targetZenithDistance", event.target.value)
          }
        />

        {/* mirror area */}
        <label htmlFor="mirror-area">Effective mirror area</label>
        <input
          id="mirror-area"
          className="input w-24"
          value={parameters.mirrorArea}
          onChange={(event) =>
            updateParameter("mirrorArea", event.target.value)
          }
        />

        {/* seeing */}
        <label htmlFor="seeing">Seeing</label>
        <input
          id="seeing"
          className="input w-24"
          value={parameters.seeing}
          onChange={(event) => updateParameter("seeing", event.target.value)}
        />
      </div>

      {/*errors */}
      {earth.hasErrors() && (
        <div>
          {["targetZenithDistance", "mirrorArea", "seeing"].map(
            (key) =>
              errors[key] && <div className="text-red-700">{errors[key]}</div>,
          )}
        </div>
      )}
    </div>
  );
}
