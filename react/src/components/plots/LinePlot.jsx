import React, { useEffect, useRef } from 'react';
import './linePlot.css';
import { Line } from 'react-chartjs-2';
import {CategoryScale, LinearScale, Chart as ChartJS, PointElement, LineElement} from "chart.js";

export function LinePlot(data) {
    return (
        <div className="chart-container">
            { data.isOutdated && <div className="watermark">Outdated</div>}
            <Line data={data.data} />
        </div>
        );

}
