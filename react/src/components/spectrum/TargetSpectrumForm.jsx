import SpectrumSelector from "./SpectrumSelector.jsx";
import SpectrumComponentForm from "./SpectrumComponentForm.jsx";

export default function TargetSpectrumForm({ spectrumComponents }) {
  return (
    <>
      <SpectrumSelector />
      {spectrumComponents.map((component, index) => (
        <SpectrumComponentForm index={index} key={index}>
          {component}
        </SpectrumComponentForm>
      ))}
    </>
  );
}
