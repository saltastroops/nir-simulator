import { input } from "../utils.ts";
import Errors from "../Errors.tsx";

interface EarthParameters {
  targetZenithDistance: string;
  mirrorArea: string;
  seeing: string;
}

export class Earth {
  public targetZenithDistance = "37";
  public mirrorArea = "460000";
  public seeing = "2.1";

  public constructor(parameters?: EarthParameters) {
    if (parameters) {
      this.targetZenithDistance = parameters.targetZenithDistance;
      this.mirrorArea = parameters.mirrorArea;
      this.seeing = parameters.seeing;
    }
  }

  public get errors() {
    const data = this.data;
    const errors: Record<string, string> = {};

    // target zenith distance
    const targetZenithDistance = data.targetZenithDistance;
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
    const mirrorArea = data.mirrorArea;
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
    const seeing = data.seeing;
    const minSeeing = 0.5;
    const maxSeeing = 5;
    if (Number.isNaN(seeing) || seeing < minSeeing || seeing > maxSeeing) {
      errors.seeing = `The seeing must be a number between ${minSeeing} and ${maxSeeing}.`;
    }

    return errors;
  }

  public get data() {
    return {
      targetZenithDistance: parseFloat(this.targetZenithDistance),
      mirrorArea: parseFloat(this.mirrorArea),
      seeing: parseFloat(this.seeing),
    };
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  earth: Earth;
  update: (earth: Earth) => void;
}

export function EarthPanel({ earth, update }: Props) {
  const { targetZenithDistance, mirrorArea, seeing, errors } = earth;

  const updateParameter = (parameter: string, newValue: string) => {
    update(
      new Earth({
        targetZenithDistance,
        mirrorArea,
        seeing,
        [parameter]: newValue,
      }),
    );
  };

  return (
    <div>
      <div className="field">
        {/* target zenith distance */}
        <label htmlFor="obsercvation-year">Target ZD (degrees)</label>
        <div className="control">
          <input
            id="observation-year"
            className={input("w-48")}
            value={targetZenithDistance}
            onChange={(event) =>
              updateParameter("targetZenithDistance", event.target.value)
            }
          />
        </div>
      </div>

      {/* mirror area */}
      <div className="field">
        <label htmlFor="mirror-area">Effective mirror area (cm²)</label>
        <div className="control">
          <input
            id="mirror-area"
            className={input("w-48")}
            value={mirrorArea}
            onChange={(event) =>
              updateParameter("mirrorArea", event.target.value)
            }
          />
        </div>
      </div>

      {/* seeing */}
      <div className="field">
        <label htmlFor="seeing">Seeing (arcseconds)</label>
        <div className="control">
          <input
            id="seeing"
            className={input("w-48")}
            value={seeing}
            onChange={(event) => updateParameter("seeing", event.target.value)}
          />
        </div>
      </div>

      {/*errors */}
      {earth.hasErrors && (
        <Errors
          errors={errors}
          keys={["targetZenithDistance", "mirrorArea", "seeing"]}
        />
      )}
    </div>
  );
}
