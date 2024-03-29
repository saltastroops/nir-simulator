import { input } from "../utils.ts";
import Errors from "../Errors.tsx";

interface SunParameters {
  year: string;
  solarElongation: string;
  eclipticLatitude: string;
}

export class Sun {
  public year = "" + new Date().getFullYear();
  public solarElongation = "180";
  public eclipticLatitude = "-90";

  public constructor(parameters?: SunParameters) {
    if (parameters) {
      this.year = parameters.year;
      this.solarElongation = parameters.solarElongation;
      this.eclipticLatitude = parameters.eclipticLatitude;
    }
  }

  public get errors() {
    const data = this.data;
    const errors: Record<string, string> = {};

    // year
    const year = data.year;
    // if the string value of the year is a float, the parsed value is nonetheless an
    // integer (as parseInt is used); so we have to explicitly check whether the
    // string value is indeed an integer
    const isYearInteger = Number.isInteger(parseFloat(this.year));
    const minYear = 2005;
    const maxYear = 2100;
    if (!isYearInteger || year < minYear || year > maxYear) {
      errors.year = `The year must be an integer between ${minYear} and ${maxYear}.`;
    }

    // solar elongation
    const solarElongation = data.solarElongation;
    const minSolarElongation = 0;
    const maxSolarElongation = 180;
    if (
      Number.isNaN(solarElongation) ||
      solarElongation < minSolarElongation ||
      solarElongation > maxSolarElongation
    ) {
      errors.solarElongation = `The solar elongation must be a number between ${minSolarElongation} and ${maxSolarElongation}.`;
    }

    // ecliptic latitude
    const eclipticLatitude = data.eclipticLatitude;
    const minEclipticLatitude = -90;
    const maxEclipticLatitude = 90;
    if (
      Number.isNaN(eclipticLatitude) ||
      eclipticLatitude < minEclipticLatitude ||
      eclipticLatitude > maxEclipticLatitude
    ) {
      errors.eclipticLatitude = `The ecliptic latitude must be a number between ${minEclipticLatitude} and ${maxEclipticLatitude}.`;
    }

    return errors;
  }

  public get data() {
    return {
      year: parseInt(this.year, 10),
      solarElongation: parseFloat(this.solarElongation),
      eclipticLatitude: parseFloat(this.eclipticLatitude),
    };
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  sun: Sun;
  update: (sun: Sun) => void;
}

export default function SunPanel({ sun, update }: Props) {
  const { year, solarElongation, eclipticLatitude, errors } = sun;

  const updateParameter = (parameter: string, newValue: string) => {
    update(
      new Sun({
        year,
        solarElongation,
        eclipticLatitude,
        [parameter]: newValue,
      }),
    );
  };

  return (
    <div>
      <div>
        {/* year */}
        <div className="field">
          <label htmlFor="observation-year">Obs. Year</label>
          <div className="control">
            <input
              id="observation-year"
              className={input("w-48")}
              value={year}
              onChange={(event) => updateParameter("year", event.target.value)}
            />
          </div>
        </div>

        {/* solar elongation */}
        <div className="field">
          <label htmlFor="solar-elongation">Solar Elongation</label>
          <div className="control">
            <input
              id="solar-elongation"
              className={input("w-48")}
              value={solarElongation}
              onChange={(event) =>
                updateParameter("solarElongation", event.target.value)
              }
            />
          </div>
        </div>

        {/* ecliptic latitude */}
        <div className="field">
          <label htmlFor="ecliptioc-latitude">Ecliptic Latitude</label>
          <div className="control">
            <input
              id="ecliptic-latitude"
              className={input("w-48")}
              value={eclipticLatitude}
              onChange={(event) =>
                updateParameter("eclipticLatitude", event.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* errors */}
      {sun.hasErrors && (
        <Errors
          errors={errors}
          keys={["year", "solarElongation", "eclipticLatitude"]}
        />
      )}
    </div>
  );
}
