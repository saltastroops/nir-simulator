import { ChangeEvent, useState } from "react";
import { SpectrumType } from "../../types";

interface Props {
  onSelect: (type: SpectrumType) => void;
}

export default function SpectrumSelector({ onSelect }: Props) {
  const [selectedType, setSelectedType] = useState<SpectrumType>("Blackbody");

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(() => event.target.value as SpectrumType);
  };

  const onClick = () => {
    onSelect(selectedType);
  };

  const spectrumTypes: SpectrumType[] = [
    "Blackbody",
    "Galaxy",
    "Emission Line",
  ];
  return (
    <div>
      <div className="select">
        <select value={selectedType} onChange={onChange}>
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
