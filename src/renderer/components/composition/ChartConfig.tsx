import { TooltipItem } from "chart.js";
import { piecewise } from "d3-interpolate";

export const assetColorPalette = [
    "#f97316",
    "#ff8800",
    "#ff9500",
    "#ffa200",
    "#ffaa00",
    "#ffb700",
    "#ffc300",
    "#ffd000",
    "#ffdd00",
    "#ffea00"
].reverse();

export const sectorColorPalette = [
    "#f72585",
    "#b5179e",
    "#7209b7",
    "#560bad",
    "#480ca8",
    "#3a0ca3",
    "#3f37c9",
    "#4361ee",
    "#4895ef",
    "#4cc9f0"
];

export const interpolatorFn = (colorPalette: string[]) =>
    piecewise(colorPalette);

const getChartConfig = (
    labels: string[],
    data: number[],
    backgroundColors: string[],
    titleText: string
) => {
    return {
        data: {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: "rgb(23 23 23)",
                    borderWidth: 4,
                    hoverBorderColor: "#fff",
                    hoverOffset: 16,
                    hoverBorderWidth: 2,
                    rotation: -45
                }
            ]
        },
        options: {
            cutout: "60%",
            radius: "95%",
            rotation: -45,
            animation: { animateScale: true },
            layout: { padding: 8 },
            plugins: {
                legend: {
                    labels: {
                        color: "#fff"
                    },
                    title: {
                        color: "#fff",
                        display: true,
                        font: {
                            family: "'Inter'",
                            size: 32,
                            weight: "600"
                        },
                        text: titleText
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: TooltipItem<"doughnut">) => {
                            let label = context.label || "";

                            if (label) {
                                label += ": ";
                            }
                            if (context.parsed !== null) {
                                label += `${context.parsed.toFixed(2)}%`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    };
};

export default getChartConfig;
