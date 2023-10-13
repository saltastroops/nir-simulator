import { useState } from 'react';
import { Spectrum } from "./spectrum/Spectrum.jsx";
import { Exposure } from "./exposure/Exposure.jsx";
import { TelescopeConfigure } from "./configure/TelescopeConfigure.jsx";

export function Tabs() {
    const [activeComponent, setActiveComponent] = useState(1);

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
            {activeComponent === 2 && <TelescopeConfigure />}
            {activeComponent === 3 && <Exposure />}
        </>
    );
}

