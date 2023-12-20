import { SimulationSetupData } from "./Simulator.tsx";

export function label(extraClasses?: string) {
  let className = "";
  if (extraClasses) {
    className += ` ${extraClasses}`;
  }
  return className;
}

export function input(extraClasses?: string) {
  let className =
    "rounded-md border border-gray-300 hover:border-gray-400 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-1.5 py-1";
  if (extraClasses) {
    className += ` ${extraClasses}`;
  }
  return className;
}

export function select(extraClasses?: string) {
  let className =
    "rounded-md border border-gray-300 shadow-sm hover:border-gray-400 focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-1.5 py-1";
  if (extraClasses) {
    className += ` ${extraClasses}`;
  }
  return className;
}

export function button(extraClasses?: string) {
  let className =
    "font-semibold rounded-md border border-gray-300 hover:border-gray-400 shadow-sm px-1.5 py-1";
  if (extraClasses) {
    className += ` ${extraClasses}`;
  }
  return className;
}

export function getExponent(value: string) {
  // Extract the exponent from the scientific notation
  const match = value.match(/e([+-]?\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function spectrumFormData(setupData: SimulationSetupData) {
  return {
    source: setupData.source,
    moon: setupData.moon,
    sun: setupData.sun,
    earth: setupData.earth,
    spectrum_plot_options: setupData.spectrumPlotOptions,
  };
}

export function throughputFormData(setupData: SimulationSetupData) {
  return {
    mode: setupData.instrumentConfiguration.modeConfiguration.mode,
    filter: setupData.instrumentConfiguration.filter,
    grating: setupData.instrumentConfiguration.modeConfiguration.grating,
    grating_angle:
      setupData.instrumentConfiguration.modeConfiguration.gratingAngle,
    source: { type: setupData.source.type, spectrum: [] },
    earth: setupData.earth,
  };
}

export function exposureFormData(setupData: SimulationSetupData) {
  return {
    mode: setupData.instrumentConfiguration.modeConfiguration.mode,
    filter: setupData.instrumentConfiguration.filter,
    grating: setupData.instrumentConfiguration.modeConfiguration.grating,
    grating_angle:
      setupData.instrumentConfiguration.modeConfiguration.gratingAngle,
    source: setupData.source,
    moon: setupData.moon,
    sun: setupData.sun,
    earth: setupData.earth,
    spectrum_plot_options: setupData.spectrumPlotOptions,
    exposure_configuration: setupData.exposureConfiguration,
  };
}
