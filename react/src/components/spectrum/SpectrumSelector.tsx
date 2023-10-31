import { ChangeEvent, useState } from "react";
import { SpectrumType } from "../../types";
import { button, select } from "../utils.ts";

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
    "User-Defined",
  ];
  return (
    <div>
      <select value={selectedType} onChange={onChange} className={select()}>
        {spectrumTypes.map((spectrumType) => (
          <option key={spectrumType}>{spectrumType}</option>
        ))}
      </select>
      <button
        className={button("ml-4 bg-green-600 text-white")}
        onClick={onClick}
      >
        Add
      </button>
    </div>
  );
}
