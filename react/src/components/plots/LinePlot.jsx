import './linePlot.css';
import { Line } from 'react-chartjs-2';

export function LinePlot({data, isOutdated}) {
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
            <Line data={plotData} options={data.options}/>
        </div>
        );

}
