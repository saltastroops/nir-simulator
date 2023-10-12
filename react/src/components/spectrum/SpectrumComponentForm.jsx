import { useContext } from "react";
import SimulationSetupContext from "../SimulationSetupContext.js";

export default function SpectrumComponentForm({ remove, children }) {
  return (
    <div>
      {children}
      <span className="link" onClick={remove}>
        Delete
      </span>
    </div>
  );
}
