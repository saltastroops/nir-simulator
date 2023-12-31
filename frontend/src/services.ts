import { SimulationSetupData } from "./components/Simulator.tsx";
import {
  exposureFormData,
  spectrumFormData,
  throughputFormData,
} from "./components/utils.ts";

function apiUrl() {
  let url = import.meta.env.VITE_BACKEND_BASE_URL;
  if (url === undefined) {
    console.warn(
      "The environment variable VITE_BACKEND_BASE_URL is not set. A reasonable default value based on the mode will be used, but you might have to set the variable in an environment file (see https://vitejs.dev/guide/env-and-mode.html).",
    );
    url = import.meta.env.MODE === "development" ? "http://localhost:8000" : "";
  }
  return url;
}

export async function spectra(setupData: SimulationSetupData) {
  const data = spectrumFormData(setupData.data);
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  const response = await fetch(apiUrl() + "/api/spectra/", {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function throughput(setupData: SimulationSetupData) {
  const data = throughputFormData(setupData.data);
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  const response = await fetch(apiUrl() + "/api/throughput/", {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function exposure(setupData: SimulationSetupData) {
  const data = exposureFormData(setupData.data);
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  const response = await fetch(apiUrl() + "/api/exposure", {
    method: "POST",
    body: formData,
  });
  return response.json();
}
