import { useState } from "react";
import { SolveExposureTime } from "../ExposurePanel.tsx";

export function SolveForExposureTime({ setupData, update }: any) {
  const updateValue = (event: any) => {
    updateSolveET(event.target.name, event.target.value);
  };

  const [wavelengthType, setWavelengthType] = useState("central");

  const wavelengthTypeChange = (targetValue: string) => {
    setWavelengthType(targetValue);
    const wavelength =
      targetValue === "central"
        ? "13000"
        : setupData.exposureConfiguration.solveExposureTime.wavelength;
    updateSolveET("wavelength", wavelength);
  };

  const updatePlot = () => {
    console.log("Update plot method not implement");
  };

  const updateSolveET = (key: "wavelength" | "requestedSNR", value: string) => {
    update({
      ...setupData.exposureConfiguration,
      solveExposureTime: new SolveExposureTime({
        ...setupData.exposureConfiguration.solveExposureTime,
        [key]: value,
      }),
    });
  };

  return (
    <>
      <div className="field">
        <label className="label">Requested SNR</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"requestedSNR"}
            value={
              setupData.exposureConfiguration.solveExposureTime.requestedSNR
            }
            onChange={updateValue}
          />
        </div>
      </div>
      <div className="field">
        <label className="label">SNR Requested @ Which Wavelength?</label>
      </div>

      <div className="columns">
        <div className="colunm  pr-4">
          <div className="control pt-5">
            <label className="radio">
              <input
                className="mr-2"
                type="radio"
                name="wavelength-type"
                value={"central"}
                checked={wavelengthType === "central"}
                onChange={(event) => wavelengthTypeChange(event.target.value)}
              />
              Central Wavelength
            </label>
          </div>
        </div>
        <div className="column">
          <div className="control">
            <input
              className="input"
              type="text"
              value={"13000"}
              disabled={true}
            />
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="colunm">
          <div className="control pt-5">
            <label className="radio">
              <input
                className="mr-2"
                type="radio"
                name="wavelength-type"
                value={"specified"}
                checked={wavelengthType === "specified"}
                onChange={(event) => wavelengthTypeChange(event.target.value)}
              />
              Specified Wavelength
            </label>
          </div>
        </div>
        <div className="column">
          <div className="control">
            <input
              className="input"
              type="text"
              name={"wavelength"}
              value={
                setupData.exposureConfiguration.solveExposureTime.wavelength
              }
              onChange={updateValue}
              disabled={!(wavelengthType === "specified")}
            />
          </div>
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
