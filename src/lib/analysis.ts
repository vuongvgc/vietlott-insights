import type { Draw, ProductConfig } from "./types";

/**
 * Count frequency of each number across draws.
 */
export function frequency(
	draws: Draw[],
	config: ProductConfig,
): Map<number, number> {
	const counts = new Map<number, number>();
	for (let n = config.range[0]; n <= config.range[1]; n++) counts.set(n, 0);
	for (const d of draws) {
		for (const n of d.numbers) {
			counts.set(n, (counts.get(n) || 0) + 1);
		}
	}
	return counts;
}

/**
 * Days since last appearance for each number.
 * Returns map of number -> days since last seen (from last draw date).
 */
export function daysSinceLastAppearance(
	draws: Draw[],
	config: ProductConfig,
): Map<number, number> {
	const lastSeen = new Map<number, string>();
	for (const d of draws) {
		for (const n of d.numbers) {
			lastSeen.set(n, d.date);
		}
	}

	const lastDate = draws[draws.length - 1]?.date;
	if (!lastDate) return new Map();

	const refTime = new Date(lastDate).getTime();
	const result = new Map<number, number>();

	for (let n = config.range[0]; n <= config.range[1]; n++) {
		const seen = lastSeen.get(n);
		if (seen) {
			const diff = Math.floor(
				(refTime - new Date(seen).getTime()) / (1000 * 60 * 60 * 24),
			);
			result.set(n, diff);
		} else {
			result.set(n, 9999); // never appeared
		}
	}
	return result;
}

/**
 * Filter draws within last N days from the last draw.
 */
export function filterRecentDraws(draws: Draw[], days: number): Draw[] {
	if (draws.length === 0) return [];
	const lastDate = new Date(draws[draws.length - 1].date).getTime();
	const cutoff = lastDate - days * 24 * 60 * 60 * 1000;
	return draws.filter((d) => new Date(d.date).getTime() >= cutoff);
}

/**
 * Pick top N from a scored map.
 */
export function topN(
	scores: Map<number, number>,
	n: number,
	order: "desc" | "asc" = "desc",
): number[] {
	const entries = [...scores.entries()];
	entries.sort((a, b) => (order === "desc" ? b[1] - a[1] : a[1] - b[1]));
	return entries.slice(0, n).map(([num]) => num);
}

/**
 * Ensure numbers are spread across quartiles of the range.
 */
export function ensureSpread(
	numbers: number[],
	pool: number[],
	config: ProductConfig,
	pick: number,
): number[] {
	const [min, max] = config.range;
	const quartileSize = (max - min + 1) / 4;
	const quartiles = [0, 1, 2, 3].map((q) => ({
		min: Math.floor(min + q * quartileSize),
		max: Math.floor(min + (q + 1) * quartileSize - 1),
	}));

	const result = [...numbers.slice(0, pick)];
	const used = new Set(result);

	// Check each quartile has at least 1 number
	for (const q of quartiles) {
		if (!result.some((n) => n >= q.min && n <= q.max)) {
			const candidate = pool.find(
				(n) => n >= q.min && n <= q.max && !used.has(n),
			);
			if (candidate && result.length >= pick) {
				// Replace the last one that's in an over-represented quartile
				const overRepQ = quartiles.find(
					(oq) => result.filter((n) => n >= oq.min && n <= oq.max).length > 2,
				);
				if (overRepQ) {
					const toRemove = result.find(
						(n) => n >= overRepQ.min && n <= overRepQ.max,
					);
					if (toRemove !== undefined) {
						const idx = result.indexOf(toRemove);
						used.delete(toRemove);
						result[idx] = candidate;
						used.add(candidate);
					}
				}
			}
		}
	}

	return result.sort((a, b) => a - b);
}
