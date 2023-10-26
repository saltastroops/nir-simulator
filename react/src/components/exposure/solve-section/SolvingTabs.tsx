import { useState } from "react";
import { SolveForSNR } from "./SolveForSNR.tsx";
import { SolveForExposureTime } from "./SolveForExposureTime.tsx";

export function SolvingTabs({ setupData, update }: any) {
  const updateWavelength = (newWavelength: any) => {
    setState({
      ...state,
      solveExposureTime: {
        ...state.solveExposureTime,
        wavelength: newWavelength,
      },
    });
  };
  const updateSNR = (newSNR: any) => {
    setState({
      ...state,
      solveExposureTime: {
        ...state.solveExposureTime,
        requestedSNR: newSNR,
      },
    });
  };

  const [state, setState] = useState({
    solveFor: "signal-to-noise",
    solveSNR: {
      exposureTime: 3600,
      detectorIterations: 1,
    },
    solveExposureTime: {
      requestedSNR: 10,
      wavelength: 13000,
    },
  });

  const switchToComponent = (componentNumber: number) => {
    setActiveTab(componentNumber);
    const solveFor =
      componentNumber === 1
        ? "Signal To Noise"
        : componentNumber === 2
        ? "Exposure Time"
        : "";
    update({
      ...setupData.exposureConfiguration,
      solveFor,
    });
  };

  const [activeTab, setActiveTab] = useState(1);

  return (
    <>
      <div className="tabs is-boxed">
        <ul>
          <li className={activeTab === 1 ? "is-active" : ""}>
            <a className="navbar-item" onClick={() => switchToComponent(1)}>
              Solve for SNR
            </a>
          </li>
          <li className={activeTab === 2 ? "is-active" : ""}>
            <a className="navbar-item" onClick={() => switchToComponent(2)}>
              Solve for Exposure Time
            </a>
          </li>
        </ul>
      </div>
      {activeTab === 1 && <SolveForSNR setupData={setupData} update={update} />}
      {activeTab === 2 && (
        <SolveForExposureTime
          setupData={setupData}
          update={update}
          solveExposureTime={state.solveExposureTime}
          updateWavelength={updateWavelength}
          updateSNR={updateSNR}
          updatePlot={update}
        />
      )}
    </>
  );
}
