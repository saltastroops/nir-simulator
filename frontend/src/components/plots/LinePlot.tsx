import "./linePlot.css";
import { Line } from "react-chartjs-2";
import { ChartContent } from "../instrument/InstrumentConfigurationTab.tsx";

interface Props {
  chartContent: ChartContent;
}

export function LinePlot({ chartContent }: Props) {
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
    <Line data={plotData} options={chartContent.chartData.options as any} />
  );
}
