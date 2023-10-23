import { SolveSNR } from "../ExposurePanel.tsx";

export function SolveForSNR({ setupData, update }: any) {
  const updateValue = (event: any) => {
    updateSolveSNR(event.target.name, event.target.value);
  };

  const updateSolveSNR = (
    key: "exposureTime" | "detectorIterations",
    value: string,
  ) => {
    update({
      ...setupData.exposureConfiguration,
      solveSNR: new SolveSNR({
        ...setupData.exposureConfiguration.solveSNR,
        [key]: value,
      }),
    });
  };

  const updatePlot = () => {
    console.log(setupData);
  };

  return (
    <>
      <div className="field">
        <label className="label">Exposure Time</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"exposureTime"}
            value={setupData.exposureConfiguration.solveSNR.exposureTime}
            onChange={updateValue}
          />
        </div>
      </div>
      <div className="field">
        <label className="label">Detector Iterations</label>
        <div className="control">
          <input
            className="input"
            type="text"
            name={"detectorIterations"}
            value={setupData.exposureConfiguration.solveSNR.detectorIterations}
            onChange={updateValue}
          />
        </div>
      </div>
      <div className="field ">
        <div className="control">
          <button className="button is-link" onClick={updatePlot}>
            Solve for Signal to Noice
          </button>
        </div>
      </div>
    </>
  );
}
