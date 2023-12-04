interface ScaleOptions {
  type: string;
  title: {
    display: boolean;
    text: string;
  };
  max?: number;
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

function getExponent(value: string) {
  // Extract the exponent from the scientific notation
  const match = value.match(/e([+-]?\d+)/);
  return match ? parseInt(match[1], 10) : 0;
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

function roundToTwoDecimalPlaces(value: number): number {
  const roundedValue = Math.round(value * 100) / 100;
  return Number.isInteger(roundedValue)
    ? roundedValue
    : parseFloat(roundedValue.toFixed(2));
}

function maxPlotValue(values: number[]): number {
  const lineMax = Math.max(...values);
  return lineMax + lineMax / 11;
}

export function defaultSpectrumPlotOptions(
  xLabel: string,
  yLabel: string,
  title: string,
  spectrum: number[],
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
        max: maxPlotValue(spectrum),
        ticks: {
          callback: (value: number) => {
            const scienceNotation = value.toExponential(1);
            const exponent = getExponent(scienceNotation);
            return exponent >= 2 || exponent <= -3
              ? value.toExponential(1)
              : roundToTwoDecimalPlaces(value).toString();
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
