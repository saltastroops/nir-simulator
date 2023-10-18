import {useState} from "react";
import "./TelescopeConfigure.css"
import {LinePlot} from "../plots/LinePlot.jsx";
import { environment } from '../../environmets/environment';
import {ConfigurationOptions} from "./ConfigutarionOptions.jsx";
import {SpecificModeOptions} from "./SpecificModeOptions.jsx";

export function TelescopeConfigure({state, setState}) {
    const [error, setError] = useState(null)

    const instrumentModeChange = (event) => {
        const  value = event.target.value
        setState({
            ...state,
            configure: {
                ...state.configure,
                configurationOptions: value,
                disableModeOptions: value === 'imaging-mode',
                isOutdated: true
            }
        });
    };
    const selectorChange = (event) => {
        const selectName = event.target.name
        const selectValue = event.target.value
        setState({
            ...state,
            configure: {
                ...state.configure,
                [selectName]: selectValue,
                isOutdated: true
            }

        });
    };
    const updatePlot = (e) => {
        e.preventDefault()
        const formData  = {
            configuration_options: state.configure.configurationOptions,
            filter: state.configure.filter,
            slit_type: state.configure.slitType,
            slit_width: state.configure.slitWidth,
            grating: state.configure.grating,
            grating_angle: state.configure.gratingAngle,
            target_zd: state.exposure.target_zd,

        };
        // Convert the data to URL-encoded format
        const data = new URLSearchParams();
        for (const key in formData) {
            data.append(key, formData[key]);
        }

        fetch( environment.apiUrl+ '/throughput/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data.toString(),
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Opps, Something went wrong.');
            }
            return response.json();
        }).then((data) => {
            setState({
                ...state,
                configure: {
                    ...state.configure,
                    isOutdated: false,
                    requested: true,
                    chartData: {
                        ...state.configure.chartData,
                        x: data.x,
                        y: data.y
                    }
                }

            });
            setError(null)
        })
            .catch((err) => {
                setError("Failed to fetch plot data.")
                console.error('Error fetching plot data:', err);
            });
    };

    return (
        <div className="container">
            <div className="columns">
                <div className="column is-one-fifth">
                    <div className="tile is-parent is-vertical notification">
                        <ConfigurationOptions
                            instrumentModeChange={instrumentModeChange}
                            instrumentMode={state.configure.configurationOptions}
                            filterChange={selectorChange}
                            selectedFilter={state.configure.filter}
                        />
                        <SpecificModeOptions
                            selectorChange={selectorChange}
                            values={state.configure}
                        />
                        <div>
                            <div className="tile">
                                <button className={!error ? "button" : "button is-danger"} onClick={updatePlot}>Update Throughput</button>
                            </div>
                            {error && <div className="tile">
                                <p className={"has-text-danger"}>{error}</p>
                            </div>}
                        </div>
                    </div>
                </div>

                <div className="column notification">
                    <div className={!error ? "tile" : "tile notification is-danger"}>
                        <LinePlot
                            data={state.configure.chartData}
                            isOutdated={state.configure.isOutdated && state.configure.requested}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
