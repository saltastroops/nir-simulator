import { getExponent } from "../utils.ts";

interface ScaleOptions {
  type: string;
  title: {
    display: boolean;
    text: string;
  };
  ticks?:
    | {
        min: number;
        max: number;
        stepSize: number;
      }
    | {
        callback: (value: number) => string;
      };
}
interface ScalesOptions {
  x: ScaleOptions;
  y: ScaleOptions;
}

interface PluginsOptions {
  title: {
    display: boolean;
    text: string;
  };
}

export interface LineOptions {
  scales: ScalesOptions;
  plugins: PluginsOptions;
}
export function defaultLinePlotOptions(
  xLabel: string,
  yLabel: string,
  title: string,
): LineOptions {
  return {
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: xLabel,
        },
        ticks: {
          min: 8000,
          max: 18000,
          stepSize: 1000,
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: yLabel,
        },
        ticks: {
          callback: (value: number) => {
            // Format the tick value to scientific notation
            const disp_value = Number(value).toExponential(1);
            const exponent = getExponent(Number(value).toExponential(1));

            return exponent >= 2 || exponent <= -3 ? disp_value : String(value);
          },
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
  };
}
