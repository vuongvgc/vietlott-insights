/**
 * Snapshot script: replay 6 strategies trên 100 kỳ gần nhất,
 * so sánh với kết quả thực, lưu vào data/snapshots/{product}.json.
 *
 * Chạy: npm run snapshot (hoặc npx tsx scripts/snapshot.ts)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// --- Inline types (avoid TSConfig path aliases in scripts) ---

interface ProductConfig {
	key: string;
	label: string;
	range: [number, number];
	pick: number;
	hasBonus: boolean;
	url: string;
}

interface Draw {
	date: string;
	id: string;
	numbers: number[];
	bonus?: number;
}

interface PrizeRule {
	tier: string;
	matched: number;
	requiresBonus?: boolean;
	label: string;
}

interface SnapshotResult {
	matched: number;
	matchedBonus: boolean;
	prizeTier: string | null;
	tierLabel: string;
}

interface SnapshotEntry {
	drawId: string;
	drawDate: string;
	actual: number[];
	actualBonus?: number;
	suggestions: Record<string, { numbers: number[]; seed?: string }>;
	results: Record<string, SnapshotResult>;
}

// --- Products ---

const PRODUCTS: Record<string, ProductConfig> = {
	power655: {
		key: "power655",
		label: "Power 6/55",
		range: [1, 55],
		pick: 6,
		hasBonus: true,
		url: "https://raw.githubusercontent.com/vietvudanh/vietlott-data/main/data/power655.jsonl",
	},
	mega645: {
		key: "mega645",
		label: "Mega 6/45",
		range: [1, 45],
		pick: 6,
		hasBonus: false,
		url: "https://raw.githubusercontent.com/vietvudanh/vietlott-data/main/data/power645.jsonl",
	},
};

// --- Prize rules ---

const PRIZE_RULES: Record<string, PrizeRule[]> = {
	power655: [
		{ tier: "jackpot1", matched: 6, requiresBonus: true, label: "Jackpot 1" },
		{ tier: "jackpot2", matched: 6, requiresBonus: false, label: "Jackpot 2" },
		{ tier: "first", matched: 5, requiresBonus: true, label: "Giải Nhất" },
		{ tier: "second", matched: 5, requiresBonus: false, label: "Giải Nhì" },
		{ tier: "third", matched: 4, label: "Giải Ba" },
		{ tier: "fourth", matched: 3, label: "Giải Tư" },
	],
	mega645: [
		{ tier: "jackpot1", matched: 6, label: "Jackpot" },
		{ tier: "first", matched: 5, label: "Giải Nhất" },
		{ tier: "second", matched: 4, label: "Giải Nhì" },
		{ tier: "third", matched: 3, label: "Giải Ba" },
	],
};

// --- Fetch draws ---

async function fetchDraws(config: ProductConfig): Promise<Draw[]> {
	const res = await fetch(config.url);
	if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
	const text = await res.text();
	return text
		.trim()
		.split("\n")
		.map((line) => {
			try {
				const raw = JSON.parse(line);
				if (config.hasBonus && raw.result.length >= 7) {
					const bonus = raw.result[raw.result.length - 1];
					const mainNumbers = raw.result
						.slice(0, 6)
						.sort((a: number, b: number) => a - b);
					return { date: raw.date, id: raw.id, numbers: mainNumbers, bonus };
				}
				return {
					date: raw.date,
					id: raw.id,
					numbers: [...raw.result]
						.sort((a: number, b: number) => a - b)
						.slice(0, 6),
				};
			} catch {
				return null;
			}
		})
		.filter((d): d is Draw => d !== null)
		.sort((a, b) => a.date.localeCompare(b.date));
}

// --- Analysis helpers (inlined to avoid import issues) ---

function frequency(draws: Draw[], max: number): Map<number, number> {
	const freq = new Map<number, number>();
	for (let i = 1; i <= max; i++) freq.set(i, 0);
	for (const d of draws)
		for (const n of d.numbers) freq.set(n, (freq.get(n) || 0) + 1);
	return freq;
}

function daysSinceLastAppearance(
	draws: Draw[],
	max: number,
): Map<number, number> {
	const last = new Map<number, number>();
	for (let i = 1; i <= max; i++) last.set(i, draws.length);
	for (let i = draws.length - 1; i >= 0; i--) {
		for (const n of draws[i].numbers) {
			if (last.get(n) === draws.length) last.set(n, draws.length - 1 - i);
		}
	}
	return last;
}

function topN(map: Map<number, number>, n: number, desc = true): number[] {
	return [...map.entries()]
		.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]))
		.slice(0, n)
		.map(([k]) => k);
}

function ensureSpread(
	nums: number[],
	pool: number[],
	pick: number,
	range: [number, number],
): number[] {
	const [min, max] = range;
	const bandSize = Math.floor((max - min + 1) / 3);
	const bands = [
		[min, min + bandSize - 1],
		[min + bandSize, min + 2 * bandSize - 1],
		[min + 2 * bandSize, max],
	];
	const result = [...nums.slice(0, pick)];
	for (const [lo, hi] of bands) {
		if (!result.some((n) => n >= lo && n <= hi)) {
			const candidate = pool.find(
				(n) => n >= lo && n <= hi && !result.includes(n),
			);
			if (candidate && result.length >= pick) {
				result[result.length - 1] = candidate;
			}
		}
	}
	return result.sort((a, b) => a - b).slice(0, pick);
}

// --- Seeded RNG ---

function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function hashSeed(str: string): number {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
	}
	return h;
}

// --- 6 Strategies (self-contained for script) ---

type StrategyFn = (
	draws: Draw[],
	config: ProductConfig,
	opts?: { seed?: string },
) => number[];

const strategies: Record<string, StrategyFn> = {
	hot(draws, config) {
		const recent = draws.slice(-100);
		const freq = frequency(recent, config.range[1]);
		return topN(freq, config.pick, true).sort((a, b) => a - b);
	},

	cold(draws, config) {
		const days = daysSinceLastAppearance(draws, config.range[1]);
		return topN(days, config.pick, true).sort((a, b) => a - b);
	},

	balanced(draws, config) {
		const recent = draws.slice(-100);
		const freq = frequency(recent, config.range[1]);
		const days = daysSinceLastAppearance(draws, config.range[1]);
		const hot = topN(freq, config.pick, true);
		const cold = topN(days, config.pick, true);
		const half = Math.floor(config.pick / 2);
		const mix = [
			...hot.slice(0, half),
			...cold
				.filter((n) => !hot.slice(0, half).includes(n))
				.slice(0, config.pick - half),
		];
		const pool = [...hot, ...cold];
		return ensureSpread(mix, pool, config.pick, config.range);
	},

	cooccurrence(draws, config) {
		const max = config.range[1];
		const pairCount = new Map<string, number>();
		const solo = new Map<number, number>();
		for (const d of draws) {
			for (const n of d.numbers) solo.set(n, (solo.get(n) || 0) + 1);
			for (let i = 0; i < d.numbers.length; i++) {
				for (let j = i + 1; j < d.numbers.length; j++) {
					const key = `${d.numbers[i]},${d.numbers[j]}`;
					pairCount.set(key, (pairCount.get(key) || 0) + 1);
				}
			}
		}
		const total = draws.length;
		const minSupport = Math.max(3, Math.floor(total * 0.01));
		const lifts: { a: number; b: number; lift: number; count: number }[] = [];
		for (const [key, count] of pairCount) {
			if (count < minSupport) continue;
			const [a, b] = key.split(",").map(Number);
			const pA = (solo.get(a) || 0) / total;
			const pB = (solo.get(b) || 0) / total;
			const pAB = count / total;
			if (pA > 0 && pB > 0) {
				lifts.push({ a, b, lift: pAB / (pA * pB), count });
			}
		}
		lifts.sort((x, y) => y.lift - x.lift);
		const chosen = new Set<number>();
		if (lifts.length > 0) {
			chosen.add(lifts[0].a);
			chosen.add(lifts[0].b);
		}
		while (chosen.size < config.pick && lifts.length > 0) {
			let bestNum = -1;
			let bestScore = -1;
			for (let n = 1; n <= max; n++) {
				if (chosen.has(n)) continue;
				let score = 0;
				for (const c of chosen) {
					const key = Math.min(n, c) + "," + Math.max(n, c);
					score += pairCount.get(key) || 0;
				}
				if (score > bestScore) {
					bestScore = score;
					bestNum = n;
				}
			}
			if (bestNum < 0) break;
			chosen.add(bestNum);
		}
		// Fallback if not enough
		if (chosen.size < config.pick) {
			for (let n = 1; n <= max && chosen.size < config.pick; n++) {
				chosen.add(n);
			}
		}
		return [...chosen].sort((a, b) => a - b);
	},

	unpopular(_draws, config) {
		const [min, max] = config.range;
		const pool: number[] = [];
		for (let n = min; n <= max; n++) {
			if (n >= 1 && n <= 31) continue; // skip birthday numbers
			pool.push(n);
		}
		// Remove consecutive pairs
		const result: number[] = [];
		for (const n of pool) {
			if (result.length > 0 && n === result[result.length - 1] + 1) continue;
			result.push(n);
			if (result.length >= config.pick) break;
		}
		// Fallback
		while (result.length < config.pick) {
			for (let n = 32; n <= max; n++) {
				if (!result.includes(n)) {
					result.push(n);
					break;
				}
			}
		}
		return result.sort((a, b) => a - b);
	},

	random(_draws, config, opts) {
		const [min, max] = config.range;
		const pool: number[] = [];
		for (let n = min; n <= max; n++) pool.push(n);
		const rng = opts?.seed ? mulberry32(hashSeed(opts.seed)) : Math.random;
		const arr = [...pool];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr.slice(0, config.pick).sort((a, b) => a - b);
	},
};

// --- Evaluate prize ---

function evaluatePrize(
	suggestion: number[],
	actual: number[],
	actualBonus: number | undefined,
	rules: PrizeRule[],
): SnapshotResult {
	const actualSet = new Set(actual);
	const matched = suggestion.filter((n) => actualSet.has(n)).length;
	const matchedBonus =
		actualBonus !== undefined && suggestion.includes(actualBonus);

	let prizeTier: string | null = null;
	let tierLabel = "";

	for (const rule of rules) {
		if (rule.matched !== matched) continue;
		if (rule.requiresBonus === true && !matchedBonus) continue;
		if (rule.requiresBonus === false && matchedBonus) continue;
		prizeTier = rule.tier;
		tierLabel = rule.label;
		break;
	}

	return { matched, matchedBonus, prizeTier, tierLabel };
}

// --- Main ---

const LOOKBACK = 100;
const OUT_DIR = resolve(
	import.meta.dirname || __dirname,
	"..",
	"data",
	"snapshots",
);

async function processProduct(key: string) {
	const config = PRODUCTS[key];
	const rules = PRIZE_RULES[key];
	console.log(`\n📦 ${config.label} — fetching draws...`);
	const draws = await fetchDraws(config);
	console.log(`   ${draws.length} kỳ quay loaded`);

	// Load existing snapshots
	const outPath = resolve(OUT_DIR, `${key}.json`);
	let existing: SnapshotEntry[] = [];
	if (existsSync(outPath)) {
		try {
			existing = JSON.parse(readFileSync(outPath, "utf-8"));
		} catch {
			existing = [];
		}
	}
	const existingIds = new Set(existing.map((e) => e.drawId));

	// Process last LOOKBACK draws
	const startIdx = Math.max(50, draws.length - LOOKBACK); // need >= 50 history
	let added = 0;

	for (let i = startIdx; i < draws.length; i++) {
		const draw = draws[i];
		if (existingIds.has(draw.id)) continue;

		const history = draws.slice(0, i); // strictly before this draw
		const entry: SnapshotEntry = {
			drawId: draw.id,
			drawDate: draw.date,
			actual: draw.numbers,
			actualBonus: draw.bonus,
			suggestions: {},
			results: {},
		};

		for (const [sKey, fn] of Object.entries(strategies)) {
			try {
				const seed = sKey === "random" ? draw.id : undefined;
				const numbers = fn(history, config, { seed });
				entry.suggestions[sKey] = seed ? { numbers, seed } : { numbers };
				entry.results[sKey] = evaluatePrize(
					numbers,
					draw.numbers,
					draw.bonus,
					rules,
				);
			} catch {
				// Strategy may fail with limited history
				entry.suggestions[sKey] = { numbers: [] };
				entry.results[sKey] = {
					matched: 0,
					matchedBonus: false,
					prizeTier: null,
					tierLabel: "",
				};
			}
		}

		existing.push(entry);
		added++;
	}

	// Sort by date desc, keep latest LOOKBACK
	existing.sort((a, b) => b.drawDate.localeCompare(a.drawDate));
	existing = existing.slice(0, LOOKBACK);

	// Write
	if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
	writeFileSync(outPath, JSON.stringify(existing, null, 2), "utf-8");
	console.log(
		`   ✅ ${added} mới, tổng ${existing.length} entries → ${outPath}`,
	);
}

async function main() {
	console.log("🎰 Vietlott Insights — Snapshot Generator");
	for (const key of Object.keys(PRODUCTS)) {
		await processProduct(key);
	}
	console.log("\n🎉 Done!");
}

main().catch((err) => {
	console.error("❌ Error:", err);
	process.exit(1);
});
