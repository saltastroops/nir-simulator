export function ConfigurationOptions({instrumentModeChange, instrumentMode, filterChange, selectedFilter}) {
    return (
        <>
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
                                checked={instrumentMode === 'imaging-mode'}
                                onChange={instrumentModeChange}
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
                                checked={instrumentMode === 'spectroscopy-mode'}
                                onChange={instrumentModeChange}
                            />
                            Spectroscopy Mode
                        </label>
                    </div>
                    <div className="control">
                        <label className="label">Filter</label>
                        <div className="select">
                            <select
                                value={selectedFilter}
                                onChange={filterChange}
                                name="filter"
                            >
                                <option value={'clear-filter'}>Clear Filter</option>
                                <option value={'lwbf'}>LWBF</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
