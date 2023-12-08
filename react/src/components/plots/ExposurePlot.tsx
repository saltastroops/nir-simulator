import "./linePlot.css";
import { Line } from "react-chartjs-2";
import { ExposureChartContent } from "../exposure/ExposurePanel.tsx";

interface Props {
  chartContent: ExposureChartContent;
}

export function ExposurePlot({ chartContent }: Props) {
  const plotData = {
    labels: chartContent.targetElectrons.x,
    datasets: [
      {
        borderWidth: 1,
        usePointStyle: false,
        borderColor: chartContent.targetElectrons.lineColor,
        pointRadius: 0,
        data: chartContent.targetElectrons.y,
      },
    ],
  };

  return (
    <Line
      data={plotData}
      options={chartContent.targetElectrons.options as any}
    />
  );
}

export function AdditionalPlot({ chartContent }: Props) {
  const plotData = {
    labels: chartContent.additionalPlot.x,
    datasets: [
      {
        borderWidth: 1,
        usePointStyle: false,
        borderColor: chartContent.additionalPlot.lineColor,
        pointRadius: 0,
        data: chartContent.additionalPlot.y,
      },
    ],
  };

  return (
    <Line
      data={plotData}
      options={chartContent.additionalPlot.options as any}
    />
  );
}
