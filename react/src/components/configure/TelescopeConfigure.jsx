import {useState} from "react";
import axios from 'axios';
import "./TelescopeConfigure.css"
import {LinePlot} from "../plots/LinePlot.jsx";

export function TelescopeConfigure(parentState, updateParentState) {
    const [state, setState] = useState({
        configurationOptions: 'imaging-mode',
        filter1: 'clear-filter',
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
    const options = {
        scales: {
            x: [
                {
                    type: 'linear',
                    position: 'bottom',
                },
            ],
            y: [
                {
                    beginAtZero: true,
                },
            ],
        },
    };

    const parentStateUpdate = () => {
        updateParentState({...parentState, configure: {...state}})
    }

    const handleConfigurationOptionsChange = (event) => {
        const  value = event.target.value
        setState({
            ...state,
            configurationOptions: value,
            disableModeOptions: value === 'imaging-mode',
            isOutdated: true
        });
        // parentStateUpdate()
    };
    const handleSelectorChange = (event) => {
        const selectName = event.target.name
        const selectValue = event.target.value
        setState({
            ...state,
            [selectName]: selectValue,
            isOutdated: true
        });
        // parentStateUpdate()
    };
    const updatePlot = () => {
        axios.get('http://127.0.0.1:8000/throughput')
            .then((response) => {
                setState({
                    ...state,
                    isOutdated: false,
                    requested: true
                });
                const newData = {
                    labels: response.data.x,
                    datasets: [
                        {
                            label: 'Data Set 2',
                            data: response.data.y,
                        },
                    ],
                };

                setChartData(newData);
            })
            .catch((error) => {
                console.error('Error fetching plot data:', error);
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
                                            value={state.filter1}
                                            onChange={handleSelectorChange}
                                            name="filter1"
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
                        <div className="tile"><button className="button" onClick={updatePlot}>Update Throughput</button></div>
                    </div>
                </div>

                <div className="column notification">
                    <div className="tile">
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
