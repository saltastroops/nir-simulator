import {useState} from "react";

export function MakeAnExposure(parentState, updateParentState) {
    const [state, setState] = useState({})
    const parentStateUpdate = () => {
        updateParentState({...parentState, exposure: {...state}})
    }
    return (
        <div>
            <h1 className="title is-1">Make An Exposure</h1>
            <p>The content of Make An Exposure goes here</p>
        </div>
    );
}
