import "./linePlot.css";
import { Line } from "react-chartjs-2";
import { ChartContent } from "../instrument/InstrumentConfigurationPanel.tsx";

interface Props {
  chartContent: ChartContent;
  isOutdated: boolean;
}

export function LinePlot({ chartContent, isOutdated }: Props) {
  const plotData = {
    labels: chartContent.chartData.x,
    datasets: [
      {
        borderWidth: 1,
        usePointStyle: false,
        borderColor: chartContent.chartData.lineColor,
        pointRadius: 0,
        data: chartContent.chartData.y,
      },
    ],
  };

  return (
    <div className="chart-container">
      {isOutdated && <div className="watermark">Outdated</div>}
      <Line data={plotData} options={chartContent.chartData.options as any} />
    </div>
  );
}
