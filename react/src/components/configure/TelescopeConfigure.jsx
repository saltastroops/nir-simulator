import {useState} from "react";

export function TelescopeConfigure(parentState, updateParentState) {
    const [state, setState] = useState({})
    const parentStateUpdate = () => {
        updateParentState({...parentState, configure: {...state}})
    }
    return (
        <div>
            <h1 className="title is-1">Telescope Configure</h1>
            <p>The content of Telescope Configure goes here</p>
        </div>
    );
}
