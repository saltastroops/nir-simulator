import { Error } from "../../Error.tsx";

interface SNRParameters {
  snr: string;
  wavelength: string;
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
  public get data() {
    return {
      snr: parseFloat(this.snr),
      wavelength: parseFloat(this.wavelength),
    };
  }
  public get errors() {
    const errors: Record<string, string> = {};
    const data = this.data;

    // Detector Iterations
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

    // Exposure Time
    const snr = data.snr;
    const minSnr = 1;
    if (Number.isNaN(snr) || snr < minSnr || !Number.isInteger(snr)) {
      errors.snr = `The requested signal to noise must be a positive integer greater than or equal to ${minSnr}.`;
    }

    return errors;
  }

  public get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

interface Props {
  setupData: SNR;
  update: (key: "exposureTime" | "snr", snr: SNR) => void;
}

export function ExposureTimeTab({ setupData, update }: Props) {
  const updatePlot = () => {
    console.log("Update plot method not implement"); // TODO update should come from ExposurePanel
  };

  const updateSNR = (key: "wavelength" | "snr", value: string) => {
    update(
      "snr",
      new SNR({
        ...setupData,
        [key]: value,
      }),
    );
  };

  return (
    <>
      <div className="field">
        <label className="label">Requested SNR</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"snr"}
            value={setupData.snr}
            onChange={(event) => updateSNR("snr", event.target.value)}
          />
          {setupData.errors["snr"] && <Error error={setupData.errors["snr"]} />}
        </div>
      </div>
      <div className="field">
        <label className="label">SNR Requested at Which Wavelength?</label>
      </div>

      <div className="field">
        <label className="label">Wavelength</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"wavelength"}
            value={setupData.wavelength}
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
          {setupData.errors["wavelength"] && (
            <Error error={setupData.errors["wavelength"]} />
          )}
        </div>
      </div>

      <div className="field ">
        <div className="control">
          <button className="button is-link" onClick={() => updatePlot()}>
            Solve for Exposure Time
          </button>
        </div>
      </div>
    </>
  );
}
