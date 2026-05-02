import type { Draw, ProductConfig, StrategyDef, Suggestion } from "../types";

/**
 * Unpopular strategy: avoid numbers that most people pick
 * (birthdays 1-31, patterns like consecutive, multiples of 5/10).
 * If you DO win, you're less likely to share the jackpot.
 * This is the only strategy with actual mathematical basis.
 */
export const unpopularStrategy: StrategyDef = {
	key: "unpopular",
	name: "Số Ít Người Chọn",
	description:
		"Tránh số sinh nhật (1-31), tránh chuỗi liên tiếp, tránh bội của 5 → nếu trúng, ít chia giải hơn",
	emoji: "⭐",
	generate(draws: Draw[], config: ProductConfig): Suggestion {
		const [min, max] = config.range;

		// Build pool: prefer numbers > 31 (avoid birthday bias)
		// Also avoid multiples of 5 and 10 (people love round numbers)
		const preferred: number[] = [];
		const acceptable: number[] = [];

		for (let n = min; n <= max; n++) {
			const isBirthday = n <= 31;
			const isRound = n % 5 === 0;

			if (!isBirthday && !isRound) {
				preferred.push(n);
			} else if (!isBirthday) {
				acceptable.push(n);
			}
		}

		// Shuffle preferred pool using seeded-ish approach based on latest draw
		const seed =
			draws.length > 0
				? draws[draws.length - 1].numbers.reduce((a, b) => a + b, 0)
				: 42;
		const shuffled = [...preferred];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = (seed * (i + 1) * 7 + 13) % (i + 1);
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		const selected = shuffled.slice(0, config.pick);

		// If not enough, add from acceptable
		if (selected.length < config.pick) {
			for (const n of acceptable) {
				if (!selected.includes(n)) {
					selected.push(n);
					if (selected.length >= config.pick) break;
				}
			}
		}

		// Ensure no 3+ consecutive numbers
		selected.sort((a, b) => a - b);
		for (let i = 0; i < selected.length - 2; i++) {
			if (
				selected[i + 1] === selected[i] + 1 &&
				selected[i + 2] === selected[i] + 2
			) {
				// Replace middle one with next available from pool
				const replacement = shuffled.find(
					(n) => !selected.includes(n) && n !== selected[i] + 1,
				);
				if (replacement) {
					selected[i + 1] = replacement;
					selected.sort((a, b) => a - b);
				}
			}
		}

		const rationale = [
			"Tránh số 1-31 (sinh nhật — nhiều người chọn)",
			"Tránh bội của 5 (số tròn — nhiều người thích)",
			"Tránh 3+ số liên tiếp (pattern phổ biến)",
			"→ Nếu trúng, xác suất chia giải thấp hơn (cơ sở toán học thực)",
		];

		return { numbers: selected.sort((a, b) => a - b), rationale };
	},
};
