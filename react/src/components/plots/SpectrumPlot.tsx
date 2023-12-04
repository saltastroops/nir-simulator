import "./linePlot.css";
import { Line } from "react-chartjs-2";
import { ChartContent } from "../spectrum/SpectrumGenerationTab.tsx";

interface Props {
  chartContent: ChartContent;
  isOutdated: boolean;
}

export function SpectrumPlot({ chartContent, isOutdated }: Props) {
  const plotData = {
    labels: chartContent.chartData.x,
    datasets: [
      {
        borderWidth: 1,
        usePointStyle: false,
        borderColor: chartContent.chartData.spectrumColor,
        pointRadius: 0,
        data: chartContent.chartData.spectrum,
      },
      {
        borderWidth: 1,
        usePointStyle: false,
        borderColor: chartContent.chartData.skyColor,
        pointRadius: 0,
        data: chartContent.chartData.sky,
      },
    ],
  };
  const options = chartContent.chartData.options;
  // options.scales.y.ticks;

  return (
    <div className="chart-container">
      {isOutdated && <div className="watermark">Outdated</div>}
      <Line data={plotData} options={options as any} />
    </div>
  );
}
