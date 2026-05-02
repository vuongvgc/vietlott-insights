import { filterRecentDraws, frequency, topN } from "../analysis";
import type { Draw, ProductConfig, StrategyDef, Suggestion } from "../types";

export const hotStrategy: StrategyDef = {
	key: "hot",
	name: "Số Nóng",
	description:
		"Chọn 6 số xuất hiện nhiều nhất (90 ngày × 0.6 + toàn thời gian × 0.4)",
	emoji: "🔥",
	generate(draws: Draw[], config: ProductConfig): Suggestion {
		const allFreq = frequency(draws, config);
		const recent = filterRecentDraws(draws, 90);
		const recentFreq = frequency(recent, config);

		// Weighted score
		const scores = new Map<number, number>();
		for (let n = config.range[0]; n <= config.range[1]; n++) {
			const allScore = allFreq.get(n) || 0;
			const recScore = recentFreq.get(n) || 0;
			scores.set(n, recScore * 0.6 + allScore * 0.4);
		}

		const numbers = topN(scores, config.pick);
		const rationale = numbers.map((n) => {
			const r = recentFreq.get(n) || 0;
			const a = allFreq.get(n) || 0;
			return `Số ${n}: ${r} lần (90 ngày), ${a} lần (tổng)`;
		});

		return { numbers: numbers.sort((a, b) => a - b), rationale };
	},
};
