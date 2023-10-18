import { useState } from "react";
import { Spectrum } from "./spectrum/Spectrum.jsx";
import { Exposure } from "./exposure/Exposure.jsx";
import { InstrumentConfigurationPanel } from "./instrument/InstrumentConfigurationPanel.tsx";
import { defaultLinePlotOptions } from "./plots/PlotOptions";

export function Tabs() {
  const [activeComponent, setActiveComponent] = useState(1);
  const [state, setState] = useState({
    configure: {
      configurationOptions: "imaging-mode",
      filter: "clear-filter",
      disableModeOptions: true,
      slitType: "longslit",
      slitWidth: "1.5",
      grating: "950",
      gratingAngle: "40",
      isOutdated: false,
      requested: false,
      chartData: {
        x: [],
        y: [],
        lineColor: "rgb(75, 192, 192)",
        options: defaultLinePlotOptions("Wavelength (\u212B)", "Throughput"),
      },
    },
    exposure: {
      target_zd: "31",
    },
  });
  const switchToComponent = (componentNumber) => {
    setActiveComponent(componentNumber);
  };

  return (
    <>
      <div className="tabs is-boxed">
        <ul>
          <li className={activeComponent === 1 ? "is-active" : ""}>
            <a className="navbar-item" onClick={() => switchToComponent(1)}>
              Generate Spectrum
            </a>
          </li>
          <li className={activeComponent === 2 ? "is-active" : ""}>
            <a className="navbar-item" onClick={() => switchToComponent(2)}>
              Configure NIRWALS
            </a>
          </li>
          <li className={activeComponent === 3 ? "is-active" : ""}>
            <a className="navbar-item" onClick={() => switchToComponent(3)}>
              Make an Exposure
            </a>
          </li>
        </ul>
      </div>
      {activeComponent === 1 && <Spectrum />}
      {activeComponent === 2 && (
        <InstrumentConfigurationPanel state={state} setState={setState} />
      )}
      {activeComponent === 3 && <Exposure />}
    </>
  );
}
