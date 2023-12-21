import { Error } from "../../Error.tsx";
import { input } from "../../utils.ts";

interface SNRParameters {
  snr: string;
  wavelength: string;
}

export interface SNRDataType {
  snr: number;
  wavelength: number;
}

export class SNR {
  public snr = "10";
  public wavelength = "13000";

  public constructor(snr?: SNRParameters) {
    if (snr) {
      this.snr = snr.snr;
      this.wavelength = snr.wavelength;
    }
  }
  public get data(): SNRDataType {
    return {
      snr: parseFloat(this.snr),
      wavelength: parseFloat(this.wavelength),
    };
  }
  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // Wavelength
    const wavelength = data.wavelength;
    const minWavelength = 9000;
    const maxWavelength = 17000;
    if (
      Number.isNaN(wavelength) ||
      wavelength < minWavelength ||
      wavelength > maxWavelength
    ) {
      errors.wavelength = `The wavelength must be a number between ${minWavelength} and ${maxWavelength}.`;
    }

    // SNR
    const snr = data.snr;
    const minSnr = 1;
    if (Number.isNaN(snr) || snr < minSnr || !Number.isInteger(snr)) {
      errors.snr = `The signal-to-noise ratio must be an integer greater than or equal to ${minSnr}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  snr: SNR;
  update: (key: "exposureTime" | "snr", snr: SNR) => void;
  updatePlots: () => void;
}

export function ExposureTimeQueryTab({ snr, update, updatePlots }: Props) {
  const updateSNR = (key: "wavelength" | "snr", value: string) => {
    update(
      "snr",
      new SNR({
        ...snr,
        [key]: value,
      }),
    );
  };

  return (
    <>
      <div className="field">
        <label>Requested SNR</label>
        <div className="control">
          <input
            className={input("w-52")}
            type="text"
            name={"snr"}
            value={snr.snr}
            onChange={(event) => updateSNR("snr", event.target.value)}
          />
          {snr.errors["snr"] && <Error error={snr.errors["snr"]} />}
        </div>
      </div>

      <div className="field">
        <label>SNR Requested at Which Wavelength?</label>
        <div className="control">
          <input
            className={input("w-52")}
            type="text"
            name={"wavelength"}
            value={snr.wavelength}
            onChange={(event) => updateSNR("wavelength", event.target.value)}
          />
        </div>
        <div className="control">
          <span className="mr-3">Quick Select:</span>
          <span
            className="text-sky-500 cursor-pointer"
            onClick={() => updateSNR("wavelength", "13000")}
          >
            Central Wavelength
          </span>
          {snr.errors["wavelength"] && (
            <Error error={snr.errors["wavelength"]} />
          )}
        </div>
      </div>

      <div className="field ">
        <div className="control">
          <button className="button is-link" onClick={updatePlots}>
            Solve for Exposure Time
          </button>
        </div>
      </div>
    </>
  );
}
