interface ScaleOptions {
  type: string;
  title: {
    display: boolean;
    text: string;
  };
  ticks:
    | {
        min: number;
        max: number;
        stepSize: number;
      }
    | undefined;
}
interface ScalesOptions {
  x: ScaleOptions;
  y: ScaleOptions;
}

interface PluginsOptions {
  title: {
    display: boolean,
    text: string,
  },
}

export interface LineOptions {
  scales: ScalesOptions;
  plugins: PluginsOptions
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
        ticks: undefined,
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
