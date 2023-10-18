export function SpecificModeOptions({values, selectorChange}) {
    return (
        <div className="tile is-child box mt-2">
            <div className="title is-6"> Specific Mode Options</div>
            <div className="field">
                <div className="control">
                    <label className="label">Slit Type</label>
                    <div className="select">
                        <select
                            value={values.slitType}
                            disabled={values.disableModeOptions}
                            onChange={selectorChange}
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
                            value={values.slitWidth}
                            disabled={values.disableModeOptions}
                            onChange={selectorChange}
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
                            value={values.grating}
                            disabled={values.disableModeOptions}
                            onChange={selectorChange}
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
                            value={values.gratingAngle}
                            disabled={values.disableModeOptions}
                            onChange={selectorChange}
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
    )
}
