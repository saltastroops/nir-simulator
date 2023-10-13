import './linePlot.css';
import { Line } from 'react-chartjs-2';

export function LinePlot(data) {
    const options = {
        scales: {
            x: {
                type: "linear",
                title: {
                    display: true,
                    text: 'Wavelength'
                },
                ticks: {
                    min: 8000,
                    max: 18000,
                    stepSize: 1000 // <----- This prop sets the stepSize
                }
            },
            y: {
                type: "linear",
                title: {
                    display: true,
                    text: 'Throughput'
                },
            },

        },
        pan: {
            enabled: true
        },
    };

    return (
        <div className="chart-container">
            { data.isOutdated && <div className="watermark">Outdated</div>}
            <Line data={data.data} options={options}/>
        </div>
        );

}
