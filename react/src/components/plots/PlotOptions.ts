interface  Options {
    type: string;
    title: {
        display: boolean;
        text: string;
    },
    ticks: {
        min: number;
        max: number;
        stepSize: number;
    } | undefined
}
interface ScaleOptions{
    x:  Options;
    y: Options;
}

interface LineOptions{
    scales: ScaleOptions;
}
export function defaultLinePlotOptions (xLabel: string, yLabel: string): LineOptions {
    return {
        scales: {
            x: {
                type: "linear",
                title: {
                    display: true,
                    text: xLabel
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
                    text: yLabel
                },
                ticks: undefined
            },
        },
    }
}
