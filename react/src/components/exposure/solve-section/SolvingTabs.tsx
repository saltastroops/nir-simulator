import { useState } from "react";
import { SolveForSNR } from "./SolveForSNR.tsx";
import { SolveForExposureTime } from "./SolveForExposureTime.tsx";
import { SimulationSetupParameters } from "../../Simulator.tsx";
import { ExposureConfigurationType } from "../ExposurePanel.tsx";

type Props = {
  setup: SimulationSetupParameters;
  update: (newSetup: ExposureConfigurationType) => void;
};

export function SolvingTabs({ setup, update }: Props) {
  const switchToComponent = (componentNumber: number) => {
    setActiveTab(componentNumber);
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
      {activeTab === 1 && <SolveForSNR setup={setup} update={update} />}
      {activeTab === 2 && (
        <SolveForExposureTime setup={setup} update={update} />
      )}
    </>
  );
}
