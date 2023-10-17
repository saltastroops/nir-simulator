interface SunParameters {
  year: string;
  solarElongation: string;
  eclipticLatitude: string;
}

export class Sun {
  public parameters: SunParameters = {
    year: "" + new Date().getFullYear(),
    solarElongation: "180",
    eclipticLatitude: "-90",
  };

  public constructor(parameters?: SunParameters) {
    if (parameters) {
      this.parameters = parameters;
    }
  }

  public errors = () => {
    const parameters = this.typedParameters();
    const errors: Record<string, string> = {};

    // year
    const year = parameters.year;
    // if the string value of the year is a float, the parsed value is nonetheless an
    // integer (as parseInt is used); so we have to explicitly check whether the
    // string value is indeed an integer
    const isYearInteger = Number.isInteger(parseFloat(this.parameters.year));
    const minYear = 2005;
    const maxYear = 2100;
    if (!isYearInteger || year < minYear || year > maxYear) {
      errors.year = `The year must be an integer between ${minYear} and ${maxYear}.`;
    }

    // solar elongation
    const solarElongation = parameters.solarElongation;
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
    const eclipticLatitude = parameters.eclipticLatitude;
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
  };

  public typedParameters = () => ({
    year: parseInt(this.parameters.year, 10),
    solarElongation: parseFloat(this.parameters.solarElongation),
    eclipticLatitude: parseFloat(this.parameters.eclipticLatitude),
  });

  public hasErrors = () => {
    return Object.keys(this.errors()).length > 0;
  };
}

interface Props {
  sun: Sun;
  update: (sun: Sun) => void;
}

export default function SunPanel({ sun, update }: Props) {
  const parameters = sun.parameters;
  const errors = sun.errors();

  const updateParameter = (parameter: string, newValue: string) => {
    update(
      new Sun({
        ...parameters,
        [parameter]: newValue,
      }),
    );
  };

  return (
    <div>
      <div className="flex items-center">
        {/* year */}
        <label htmlFor="observation-year">Obs. Year</label>
        <input
          id="observation-year"
          className="input w-24"
          value={parameters.year}
          onChange={(event) => updateParameter("year", event.target.value)}
        />

        {/* solar elongation */}
        <label htmlFor="solar-elongation">Solar Elongation</label>
        <input
          id="solar-elongation"
          className="input w-24"
          value={parameters.solarElongation}
          onChange={(event) =>
            updateParameter("solarElongation", event.target.value)
          }
        />

        {/* ecliptic latitude */}
        <label htmlFor="ecliptioc-latitude">Ecliptic Latitude</label>
        <input
          id="ecliptic-latitude"
          className="input w-24"
          value={parameters.eclipticLatitude}
          onChange={(event) =>
            updateParameter("eclipticLatitude", event.target.value)
          }
        />
      </div>

      {/* errors */}
      {sun.hasErrors() && (
        <div>
          {["year", "solarElongation", "eclipticLatitude"].map(
            (key) =>
              errors[key] && <div className="text-red-700">{errors[key]}</div>,
          )}
        </div>
      )}
    </div>
  );
}
