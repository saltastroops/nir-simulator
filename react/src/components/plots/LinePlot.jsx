import './linePlot.css';
import { Line } from 'react-chartjs-2';

export function LinePlot({data, isOutdated}) {
    const options = {
        scales: {
            x: {
                type: "linear",
                title: {
                    display: true,
                    text: data.xLabel
                },
                ticks: {
                    min: 8000,
                    max: 18000,
                    stepSize: 1000
                }
            },
            y: {
                type: "linear",
                title: {
                    display: true,
                    text: data.yLabel
                },
            },
        },
    };
    const plotData = {
        labels: data.x,
        datasets: [
            {
                borderWidth: 1,
                usePointStyle: false,
                borderColor: data.lineColor,
                pointRadius: 0,
                data: data.y,
            },
        ],
    };

    return (
        <div className="chart-container">
            { isOutdated && <div className="watermark">Outdated</div>}
            <Line data={plotData} options={options}/>
        </div>
        );

}
