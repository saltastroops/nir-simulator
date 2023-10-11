import React, { useState } from 'react';
import { GeneralSpectra } from "./general-spectra/GeneralSpectra.jsx";
import { MakeAnExposure } from "./exposure/MakeAnExposure.jsx";
import { TelescopeConfigure } from "./configure/TelescopeConfigure.jsx";

export function Tabs() {
    const [activeComponent, setActiveComponent] = useState(1);
    const [state, setState] = useState({
        generate: {},
        configure: {},
        exposure: {},
    })

    const switchToComponent = (componentNumber) => {
        setActiveComponent(componentNumber);
    };
    const updateState = (newState) => {
        setState(newState);
    };

    return (
        <div className="container">
            <div className="tabs is-boxed">
                <ul>
                    <li className={activeComponent === 1 ? "is-active" : ""}>
                        <a className="navbar-item" onClick={() => switchToComponent(1)}>
                            General Spectra
                        </a>
                    </li>
                    <li className={activeComponent === 2 ? "is-active" : ""}>
                        <a className="navbar-item" onClick={() => switchToComponent(2)}>
                            Configure
                        </a>
                    </li>
                    <li className={activeComponent === 3 ? "is-active" : ""}>
                        <a className="navbar-item" onClick={() => switchToComponent(3)}>
                            Make an Exposure
                        </a>
                    </li>
                </ul>
            </div>
            {activeComponent === 1 && <GeneralSpectra state={state} updateState={updateState} />}
            {activeComponent === 2 && <TelescopeConfigure state={state} updateState={updateState} />}
            {activeComponent === 3 && <MakeAnExposure state={state} updateState={updateState} />}
        </div>
    );
}

