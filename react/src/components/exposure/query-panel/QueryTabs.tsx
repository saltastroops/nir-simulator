import { useState } from "react";
import { ExposureTime, SNRTab } from "./SNRTab.tsx";
import { ExposureTimeTab, SNR } from "./ExposureTimeTab.tsx";
import { ExposureConfiguration } from "../ExposurePanel.tsx";

interface Props {
  setupData: ExposureConfiguration;
  update: (newSetup: ExposureConfiguration) => void;
}

export function QueryTabs({ setupData, update }: Props) {
  const switchToComponent = (componentNumber: number) => {
    setActiveTab(componentNumber);
  };

  const [activeTab, setActiveTab] = useState(1);

  const updateQuery = (key: string, newQuery: ExposureTime | SNR) => {
    update(
      new ExposureConfiguration({
        ...setupData,
        [key]: newQuery,
      }),
    );
  };

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
      {activeTab === 1 && (
        <SNRTab setupData={setupData.exposureTime} update={updateQuery} />
      )}
      {activeTab === 2 && (
        <ExposureTimeTab setupData={setupData.snr} update={updateQuery} />
      )}
    </>
  );
}
