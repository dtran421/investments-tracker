import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import _ from "lodash";

import getChartConfig, {
    assetColorPalette,
    interpolatorFn,
    sectorColorPalette
} from "../components/composition/ChartConfig";
import { AssetData } from "../../../types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CompositionProps {
    assets: AssetData[];
}

const Composition = ({ assets }: CompositionProps) => {
    const assetData = _.sortBy(assets, ["allocation"]);
    const sectorData = _.sortBy(
        _.map(_.groupBy(assets, "sector"), (assetsArr, sector) => ({
            sector: sector !== "undefined" ? sector : "Cash",
            allocation: _.sumBy(assetsArr, "allocation")
        })),
        ["allocation"]
    );

    const assetIntervalSize = 1 / assetData.length;
    const assetBackgroundColors = _.map(
        _.range(0.75 * assetIntervalSize, 1, assetIntervalSize),
        interpolatorFn(assetColorPalette)
    );

    const sectorIntervalSize = 1 / sectorData.length;
    const sectorBackgroundColors = _.map(
        _.range(0.75 * sectorIntervalSize, 1, sectorIntervalSize),
        interpolatorFn(sectorColorPalette)
    );

    return (
        <div className="flex justify-center">
            <div className="w-full grid grid-cols-2 gap-x-10">
                <div>
                    <Doughnut
                        {...getChartConfig(
                            _.map(assetData, ({ symbol }) => symbol),
                            _.map(assetData, ({ allocation }) => allocation),
                            assetBackgroundColors,
                            "Asset Diversification"
                        )}
                    />
                </div>
                <div>
                    <Doughnut
                        {...getChartConfig(
                            _.map(sectorData, ({ sector }) => sector),
                            _.map(sectorData, ({ allocation }) => allocation),
                            sectorBackgroundColors,
                            "Sector Diversification"
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default Composition;
