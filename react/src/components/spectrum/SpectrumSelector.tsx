import { useContext, useState } from "react";
import SimulationSetupContext from "../SimulationSetupContext.js";

const SPECTRUM_TYPE = {
  BLACKBODY: "Blackbody",
  EMISSION_LINE: "Emission Line",
  STAR: "Star",
};

export default function SpectrumSelector() {
  const [selectedType, setSelectedType] = useState(SPECTRUM_TYPE.BLACKBODY);
  const { addSpectrumComponent } = useContext(SimulationSetupContext);

  const onSelect = (event) => {
    setSelectedType(() => event.target.value);
  };

  const onClick = () => {
    addSpectrumComponent(selectedType);
  };

  const spectrumTypes = [
    SPECTRUM_TYPE.BLACKBODY,
    SPECTRUM_TYPE.STAR,
    SPECTRUM_TYPE.EMISSION_LINE,
  ];
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
