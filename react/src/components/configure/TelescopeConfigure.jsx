import {useState} from "react";
import "./TelescopeConfigure.css"
import {LinePlot} from "../plots/LinePlot.jsx";

export function TelescopeConfigure() {
    const [state, setState] = useState({
        configurationOptions: 'imaging-mode',
        filter: 'clear-filter',
        disableModeOptions: true,
        slitType: 'longslit',
        slitWidth: '1.5',
        grating: '950',
        gratingAngle: '40',
        isOutdated: false,
        requested: false
    });

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
            },
        ],
    });

    const [error, setError] = useState(null)

    const handleConfigurationOptionsChange = (event) => {
        const  value = event.target.value
        setState({
            ...state,
            configurationOptions: value,
            disableModeOptions: value === 'imaging-mode',
            isOutdated: true
        });
    };
    const handleSelectorChange = (event) => {
        const selectName = event.target.name
        const selectValue = event.target.value
        setState({
            ...state,
            [selectName]: selectValue,
            isOutdated: true
        });
    };
    const updatePlot = (e) => {
        e.preventDefault()
        const formData  = {
            configuration_options: state.configurationOptions,
            filter: state.filter,
            slit_type: state.slitType,
            slit_width: state.slitWidth,
            grating: state.grating,
            grating_angle: state.gratingAngle,

        };
        // Convert the data to URL-encoded format
        const data = new URLSearchParams();
        for (const key in formData) {
            data.append(key, formData[key]);
        }

        fetch('http://127.0.0.1:8000/throughput/', {
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
            console.log(formData)
            setState({
                ...state,
                isOutdated: false,
                requested: true
            });
            const newData = {
                labels: data.x,
                datasets: [
                    {
                        borderWidth: 1,
                        usePointStyle: false,
                        borderColor: 'rgb(75, 192, 192)',
                        pointRadius: 0,
                        data: data.y,
                    },
                ],
            };

            setChartData(newData);
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
                        <div className="title is-5">Configuration Options</div>
                        <div className="tile is-child box has-margin-top">
                            <div className="field">
                                <div className="control">
                                    <label className="radio">
                                        <input
                                            type="radio"
                                            className="mr-2"
                                            name="configurationOptions"
                                            value="imaging-mode"
                                            checked={state.configurationOptions === 'imaging-mode'}
                                            onChange={handleConfigurationOptionsChange}
                                        />
                                        Imaging Mode
                                    </label>
                                </div>
                                <div className="control">
                                    <label className="radio">
                                        <input
                                            type="radio"
                                            className="mr-2"
                                            name="configurationOptions"
                                            value="spectroscopy-mode"
                                            checked={state.configurationOptions === 'spectroscopy-mode'}
                                            onChange={handleConfigurationOptionsChange}
                                        />
                                        Spectroscopy Mode
                                    </label>
                                </div>
                                <div className="control">
                                    <label className="label">Filter</label>
                                    <div className="select">
                                        <select
                                            value={state.filter}
                                            onChange={handleSelectorChange}
                                            name="filter"
                                        >
                                            <option value={'clear-filter'}>Clear Filter</option>
                                            <option value={'lwbf'}>LWBF</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="tile is-child box mt-2">
                            <div className="title is-6"> Specific Mode Options</div>
                            <div className="field">
                                <div className="control">
                                    <label className="label">Slit Type</label>
                                    <div className="select">
                                        <select
                                            value={state.slitType}
                                            disabled={state.disableModeOptions}
                                            onChange={handleSelectorChange}
                                            name="slitType"
                                        >
                                            <option value="longslit">Longslit</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="control">
                                    <label className="label">Slit Width</label>
                                    <div className="select">
                                        <select
                                            value={state.slitWidth}
                                            disabled={state.disableModeOptions}
                                            onChange={handleSelectorChange}
                                            name="slitWidth"
                                        >
                                            <option value="0.6">0.6</option>
                                            <option value="1.0">1.0</option>
                                            <option value="1.25">1.25</option>
                                            <option value="1.5">1.5</option>
                                            <option value="2.0">2.0</option>
                                            <option value="3.0">3.0</option>
                                            <option value="4.0">4.0</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="control">
                                    <label className="label">Grating</label>
                                    <div className="select">
                                        <select
                                            value={state.grating}
                                            disabled={state.disableModeOptions}
                                            onChange={handleSelectorChange}
                                            name="grating"
                                        >
                                            <option value="950">950</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="control">
                                    <label className="label">Grating Angle</label>
                                    <div className="select">
                                        <select
                                            value={state.gratingAngle}
                                            disabled={state.disableModeOptions}
                                            onChange={handleSelectorChange}
                                            name="gratingAngle"
                                        >
                                            <option value="30">30</option>
                                            <option value="35">35</option>
                                            <option value="40">40</option>
                                            <option value="45">45</option>
                                            <option value="50">50</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                            data={chartData}
                            isOutdated={state.isOutdated && state.requested}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
