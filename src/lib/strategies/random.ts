import type { Draw, ProductConfig, StrategyDef, Suggestion } from "../types";

/**
 * Mulberry32 — simple seeded 32-bit PRNG.
 * Deterministic: same seed → same sequence.
 */
function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Convert string to numeric seed via simple hash */
function hashSeed(str: string): number {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
	}
	return h;
}

/**
 * Fisher-Yates shuffle with custom random function.
 */
function shuffleWithRng(arr: number[], rng: () => number): number[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export const randomStrategy: StrategyDef = {
	key: "random",
	name: "Ngẫu Nhiên",
	description: "Chọn ngẫu nhiên — baseline để so sánh với các chiến lược khác",
	emoji: "🎲",
	generate(
		draws: Draw[],
		config: ProductConfig,
		opts?: { seed?: string },
	): Suggestion {
		const [min, max] = config.range;
		const pool: number[] = [];
		for (let n = min; n <= max; n++) pool.push(n);

		// Use seeded RNG if seed provided, otherwise Math.random
		const rng = opts?.seed ? mulberry32(hashSeed(opts.seed)) : Math.random;

		const numbers = shuffleWithRng(pool, rng)
			.slice(0, config.pick)
			.sort((a, b) => a - b);

		return {
			numbers,
			rationale: [
				"Chọn hoàn toàn ngẫu nhiên",
				"Dùng làm baseline — nếu chiến lược khác không tốt hơn Random thì không có ý nghĩa thống kê",
			],
		};
	},
};
