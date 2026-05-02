import { daysSinceLastAppearance, topN } from "../analysis";
import type { Draw, ProductConfig, StrategyDef, Suggestion } from "../types";

export const coldStrategy: StrategyDef = {
	key: "cold",
	name: "Số Lạnh",
	description: "Chọn 6 số lâu chưa xuất hiện nhất (days since last appearance)",
	emoji: "❄️",
	generate(draws: Draw[], config: ProductConfig): Suggestion {
		const daysMap = daysSinceLastAppearance(draws, config);
		const numbers = topN(daysMap, config.pick, "desc");

		const rationale = numbers.map((n) => {
			const days = daysMap.get(n) || 0;
			return `Số ${n}: ${days >= 9999 ? "chưa từng ra" : `${days} ngày chưa xuất hiện`}`;
		});

		return { numbers: numbers.sort((a, b) => a - b), rationale };
	},
};
