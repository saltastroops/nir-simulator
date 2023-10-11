import { useContext } from "react";
import SimulationSetupContext from "../SimulationSetupContext.js";

export default function SpectrumComponent({ index, children }) {
  const { removeSpectrumComponent } = useContext(SimulationSetupContext);

  return (
    <div>
      {children}
      <span className="link" onClick={() => removeSpectrumComponent(index)}>
        Delete
      </span>
    </div>
  );
}
