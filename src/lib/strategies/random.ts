import type { Draw, ProductConfig, StrategyDef, Suggestion } from "../types";

export const randomStrategy: StrategyDef = {
	key: "random",
	name: "Ngẫu Nhiên",
	description: "Chọn ngẫu nhiên — baseline để so sánh với các chiến lược khác",
	emoji: "🎲",
	generate(_draws: Draw[], config: ProductConfig): Suggestion {
		const [min, max] = config.range;
		const pool: number[] = [];
		for (let n = min; n <= max; n++) pool.push(n);

		// Fisher-Yates shuffle
		for (let i = pool.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[pool[i], pool[j]] = [pool[j], pool[i]];
		}

		const numbers = pool.slice(0, config.pick).sort((a, b) => a - b);

		return {
			numbers,
			rationale: [
				"Chọn hoàn toàn ngẫu nhiên",
				"Dùng làm baseline — nếu chiến lược khác không tốt hơn Random thì không có ý nghĩa thống kê",
			],
		};
	},
};
