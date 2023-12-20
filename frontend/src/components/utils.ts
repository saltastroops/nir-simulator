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

export function throughputFormData(setupData: SimulationSetupData) {
  return {
    mode: setupData.instrumentConfiguration.modeConfiguration.mode,
    filter: setupData.instrumentConfiguration.filter,
    slit_type: setupData.instrumentConfiguration.modeConfiguration.slitType,
    slit_width: setupData.instrumentConfiguration.modeConfiguration.slitWidth,
    grating: setupData.instrumentConfiguration.modeConfiguration.grating,
    grating_angle:
      setupData.instrumentConfiguration.modeConfiguration.gratingAngle,
    target_zd: setupData.earth.targetZenithDistance,
  };
}

export function exposureFormData(setupData: SimulationSetupData) {
  return {
    seeing: 2,
    target_zenith_distance: 37,
    grating: 950,
    grating_angle: 40,
    slit_width: 1.5,
    gain: {
      read_noise: setupData.exposureConfiguration.gain.readNoise,
      adu: setupData.exposureConfiguration.gain.adu,
      full_well: setupData.exposureConfiguration.gain.fullWell,
    },
    sampling: {
      sampling_type: setupData.exposureConfiguration.sampling.samplingType,
      number_of_samples:
        setupData.exposureConfiguration.sampling.numberOfSamples,
    },
    detector_iterations:
      setupData.exposureConfiguration.exposureTime.detectorIterations,
    exposure_time:
      setupData.exposureConfiguration.exposureTime.singleExposureTime,
  };
}
