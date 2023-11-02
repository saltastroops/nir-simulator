import { useState } from "react";
import { ExposureTime, SNRQueryTab } from "./SNRQueryTab.tsx";
import { ExposureTimeQueryTab, SNR } from "./ExposureTimeQueryTab.tsx";
import { ExposureConfiguration } from "../ExposurePanel.tsx";

interface Props {
  exposureConfiguration: ExposureConfiguration;
  update: (newSetup: ExposureConfiguration) => void;
}

export function QueryTabs({ exposureConfiguration, update }: Props) {
  const switchToComponent = (componentNumber: number) => {
    setActiveTab(componentNumber);
  };

  const [activeTab, setActiveTab] = useState(1);

  const updateQuery = (key: string, newQuery: ExposureTime | SNR) => {
    update(
      new ExposureConfiguration({
        ...exposureConfiguration,
        [key]: newQuery,
      }),
    );
  };

  return (
    <>
      <div className="tabs is-boxed">
        <ul>
          <li className={activeTab === 1 ? "is-active" : ""}>
            <a className="navbar-item " onClick={() => switchToComponent(1)}>
              Solve for SNR
            </a>
          </li>
          <li className={activeTab === 2 ? "is-active" : ""}>
            <a
              className="navbar-item w-70"
              onClick={() => switchToComponent(2)}
            >
              Solve for Exposure Time
            </a>
          </li>
        </ul>
      </div>
      {activeTab === 1 && (
        <SNRQueryTab
          exposureTime={exposureConfiguration.exposureTime}
          update={updateQuery}
        />
      )}
      {activeTab === 2 && (
        <ExposureTimeQueryTab
          snr={exposureConfiguration.snr}
          update={updateQuery}
        />
      )}
    </>
  );
}
