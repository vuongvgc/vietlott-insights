import {
	daysSinceLastAppearance,
	ensureSpread,
	filterRecentDraws,
	frequency,
	topN,
} from "../analysis";
import type { Draw, ProductConfig, StrategyDef, Suggestion } from "../types";

export const balancedStrategy: StrategyDef = {
	key: "balanced",
	name: "Cân Bằng",
	description: "3 số nóng + 3 số lạnh, phân bổ đều trên dải số",
	emoji: "⚖️",
	generate(draws: Draw[], config: ProductConfig): Suggestion {
		const recent = filterRecentDraws(draws, 90);
		const recentFreq = frequency(recent, config);
		const daysMap = daysSinceLastAppearance(draws, config);

		const hotNums = topN(recentFreq, 3, "desc");
		const coldNums = topN(daysMap, 3, "desc").filter(
			(n) => !hotNums.includes(n),
		);

		// If cold overlaps hot, pick next cold
		let combined = [...hotNums, ...coldNums.slice(0, 3)];
		if (combined.length < config.pick) {
			const all = [...daysMap.entries()]
				.sort((a, b) => b[1] - a[1])
				.map(([n]) => n);
			for (const n of all) {
				if (!combined.includes(n)) {
					combined.push(n);
					if (combined.length >= config.pick) break;
				}
			}
		}

		combined = ensureSpread(
			combined,
			[...Array(config.range[1] - config.range[0] + 1)].map(
				(_, i) => i + config.range[0],
			),
			config,
			config.pick,
		);

		const rationale = [
			`3 số nóng (90 ngày): ${hotNums.join(", ")}`,
			`3 số lạnh: ${coldNums.slice(0, 3).join(", ")}`,
			"Đảm bảo phân bổ đều trên 4 phần của dải số",
		];

		return { numbers: combined.sort((a, b) => a - b), rationale };
	},
};
