import { SimulationSetupData } from "./components/Simulator.tsx";
import { environment } from "./environments/environment.ts";
import { exposureFormData, throughputFormData } from "./components/utils.ts";

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

export async function throughput(setupData: SimulationSetupData) {
  const data = throughputFormData(setupData);
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  const response = await fetch(environment.apiUrl + "/throughput/", {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function exposureSNR(setupData: SimulationSetupData) {
  const data = {
    source: setupData.source,
    moon: setupData.moon,
    sun: setupData.sun,
    earth: setupData.earth,
    spectrumPlotOptions: setupData.spectrumPlotOptions,
    instrument_setup: throughputFormData(setupData),
    exposure_configuration: exposureFormData(setupData),
  };
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  const response = await fetch(environment.apiUrl + "/exposure/snr", {
    method: "POST",
    body: formData,
  });
  return response.json();
}
