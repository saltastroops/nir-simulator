import SpectrumSelector from "./SpectrumSelector.jsx";
import SpectrumComponent from "./SpectrumComponent.jsx";

export default function TargetSpectrum({ spectrumComponents }) {
  return (
    <>
      <SpectrumSelector />
      {spectrumComponents.map((component, index) => (
        <SpectrumComponent index={index} key={index}>
          {component}
        </SpectrumComponent>
      ))}
    </>
  );
}
