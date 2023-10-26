import { SimulationSetupData } from "./components/Simulator.tsx";
import { environment } from "./environments/environment.ts";

export async function spectra(setupData: SimulationSetupData) {
  const data = {
    source: setupData.source,
    moon: setupData.moon,
    sun: setupData.sun,
    earth: setupData.earth,
    spectrumPlotOptions: setupData.spectrumPlotOptions,
  };
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  const response = await fetch(environment.apiUrl + "/spectra/", {
    method: "POST",
    body: formData,
  });
  return response.json();
}
