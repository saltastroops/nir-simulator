import SpectrumSelector from "./SpectrumSelector";
import SpectrumComponentForm from "./SpectrumComponentForm";
import { useContext } from "react";
import SimulationSetupContext from "../SimulationSetupContext.js";

export default function TargetSpectrumForm({ spectrumComponents }) {
  const { removeSpectrumComponent } = useContext(SimulationSetupContext);
  return (
    <>
      <SpectrumSelector />
      {spectrumComponents.map((component, index) => (
        <SpectrumComponentForm
          remove={() => removeSpectrumComponent(index)}
          key={index}
        >
          {component}
        </SpectrumComponentForm>
      ))}
    </>
  );
}
