import { LinePlot } from "../plots/LinePlot.tsx";
import { useState } from "react";
import { defaultLinePlotOptions } from "../plots/PlotOptions.ts";
import { ChartContent } from "../instrument/InstrumentConfigurationPanel.tsx";
import { environment } from "../../environments/environment.ts";

export function Exposure() {
  const [chartContent, setChartContent] = useState<ChartContent>({
    chartData: {
      x: [],
      y: [],
      lineColor: "rgb(75, 192, 192)",
      options: defaultLinePlotOptions("Wavelength (\u212B)", "Throughput"),
    },
    requested: false,
  });

  const updatePlot = () => {
    // const formData = new FormData();
    fetch(environment.apiUrl + "/solve/", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Opps, Something went wrong.");
        }
        return response.json();
      })
      .then((data) => {
        setChartContent((previousChartContent) => {
          const updatedChartData = {
            x: data.x,
            y: data.y,
            lineColor: previousChartContent.chartData.lineColor,
            options: previousChartContent.chartData.options,
          };
          return {
            chartData: updatedChartData,
            requested: true,
          };
        });
      })
      .catch((err) => {
        console.error("Error fetching plot data:", err);
      });
  };

  return (
    <div>
      <h1 className="title is-1">Make An Exposure</h1>
      <p>The content of Make An Exposure goes here</p>
      <LinePlot chartContent={chartContent} isOutdated={false} />
      <button onClick={() => updatePlot()}>Update</button>
    </div>
  );
}
