import { ChangeEvent, useContext, useState } from "react";
import SimulationSetupContext from "../SimulationSetupContext.js";
import { SpectrumType } from "../../types";

export default function SpectrumSelector() {
  const [selectedType, setSelectedType] = useState<SpectrumType>("Blackbody");
  const { addToSourceSpectrum } = useContext(SimulationSetupContext);

  const onSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(() => event.target.value as SpectrumType);
  };

  const onClick = () => {
    addToSourceSpectrum(selectedType);
  };

  const spectrumTypes: SpectrumType[] = ["Blackbody", "Star", "Emission Line"];
  return (
    <div>
      <div className="select">
        <select value={selectedType} onChange={onSelect}>
          {spectrumTypes.map((spectrumType) => (
            <option key={spectrumType}>{spectrumType}</option>
          ))}
        </select>
      </div>
      <button className="button ml-4" onClick={onClick}>
        Add
      </button>
    </div>
  );
}
