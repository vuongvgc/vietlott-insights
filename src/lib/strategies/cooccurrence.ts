import type { Draw, ProductConfig, StrategyDef, Suggestion } from "../types";

/**
 * Co-occurrence strategy: find pairs that appear together most often,
 * then greedily expand to 6 numbers maximizing total pair affinity.
 */
export const cooccurrenceStrategy: StrategyDef = {
	key: "cooccurrence",
	name: "Cặp Số Hay Đi Cùng",
	description:
		"Tìm các cặp số thường xuất hiện cùng nhau, mở rộng greedy đến 6 số",
	emoji: "🔗",
	generate(draws: Draw[], config: ProductConfig): Suggestion {
		// Build co-occurrence matrix (use last 300 draws for recency)
		const recentDraws = draws.slice(-300);
		const pairCount = new Map<string, number>();
		const singleCount = new Map<number, number>();

		for (const d of recentDraws) {
			for (const n of d.numbers) {
				singleCount.set(n, (singleCount.get(n) || 0) + 1);
			}
			for (let i = 0; i < d.numbers.length; i++) {
				for (let j = i + 1; j < d.numbers.length; j++) {
					const key = `${d.numbers[i]}-${d.numbers[j]}`;
					pairCount.set(key, (pairCount.get(key) || 0) + 1);
				}
			}
		}

		// Calculate lift for each pair: P(A,B) / (P(A) * P(B))
		const N = recentDraws.length;
		const lifts: { a: number; b: number; lift: number; count: number }[] = [];

		for (const [key, count] of pairCount.entries()) {
			if (count < 3) continue; // min support
			const [a, b] = key.split("-").map(Number);
			const pA = (singleCount.get(a) || 0) / N;
			const pB = (singleCount.get(b) || 0) / N;
			const pAB = count / N;
			if (pA > 0 && pB > 0) {
				lifts.push({ a, b, lift: pAB / (pA * pB), count });
			}
		}

		lifts.sort((x, y) => y.lift - x.lift);

		// Start with the top pair
		const selected: number[] = [];
		const used = new Set<number>();

		if (lifts.length > 0) {
			selected.push(lifts[0].a, lifts[0].b);
			used.add(lifts[0].a);
			used.add(lifts[0].b);
		}

		// Greedily add numbers with highest total lift to current set
		while (selected.length < config.pick) {
			let bestNum = -1;
			let bestScore = -1;

			for (let n = config.range[0]; n <= config.range[1]; n++) {
				if (used.has(n)) continue;
				let score = 0;
				for (const s of selected) {
					const key = s < n ? `${s}-${n}` : `${n}-${s}`;
					const count = pairCount.get(key) || 0;
					score += count;
				}
				if (score > bestScore) {
					bestScore = score;
					bestNum = n;
				}
			}

			if (bestNum === -1) break;
			selected.push(bestNum);
			used.add(bestNum);
		}

		const topPairs = lifts.slice(0, 3);
		const rationale = [
			`Top cặp: ${topPairs.map((p) => `(${p.a},${p.b}) lift=${p.lift.toFixed(2)}, ${p.count} lần`).join("; ")}`,
			`Phân tích ${recentDraws.length} kỳ gần nhất`,
			"Mở rộng greedy: thêm số có tổng co-occurrence cao nhất với bộ hiện tại",
		];

		return { numbers: selected.sort((a, b) => a - b), rationale };
	},
};
