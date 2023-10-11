import {useState} from "react";

export function GeneralSpectra(parentState, updateParentState) {
    const [state, setState] = useState({})
    const parentStateUpdate = () => {
        updateParentState({...parentState, generate: {...state}})
    }
    return (
        <div>
            <h1 className="title is-1">General Spectra</h1>
            <p>The content of General Spectra goes here</p>
        </div>
    );
}
