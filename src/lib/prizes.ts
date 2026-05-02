import type { PrizeRule, PrizeTier, SnapshotResult } from "./types";

// Power 6/55: 6 tiers (bonus number phân biệt Jackpot1/2 và Nhất/Nhì)
export const POWER655_PRIZES: PrizeRule[] = [
	{ tier: "jackpot1", matched: 6, requiresBonus: true, label: "Jackpot 1" },
	{ tier: "jackpot2", matched: 6, requiresBonus: false, label: "Jackpot 2" },
	{ tier: "first", matched: 5, requiresBonus: true, label: "Giải Nhất" },
	{ tier: "second", matched: 5, requiresBonus: false, label: "Giải Nhì" },
	{ tier: "third", matched: 4, label: "Giải Ba" },
	{ tier: "fourth", matched: 3, label: "Giải Tư" },
];

// Mega 6/45: 4 tiers (không có bonus)
export const MEGA645_PRIZES: PrizeRule[] = [
	{ tier: "jackpot1", matched: 6, label: "Jackpot" },
	{ tier: "first", matched: 5, label: "Giải Nhất" },
	{ tier: "second", matched: 4, label: "Giải Nhì" },
	{ tier: "third", matched: 3, label: "Giải Ba" },
];

export const PRIZE_RULES: Record<string, PrizeRule[]> = {
	power655: POWER655_PRIZES,
	mega645: MEGA645_PRIZES,
};

/**
 * So sánh bộ số gợi ý với kết quả thực tế, trả về tier giải (nếu có).
 */
export function evaluatePrize(
	suggestion: number[],
	actual: number[],
	actualBonus: number | undefined,
	rules: PrizeRule[],
): SnapshotResult {
	const actualSet = new Set(actual);
	const matched = suggestion.filter((n) => actualSet.has(n)).length;
	const matchedBonus =
		actualBonus !== undefined && suggestion.includes(actualBonus);

	let prizeTier: PrizeTier = null;
	let tierLabel = "";

	// Rules are ordered from highest to lowest — first match wins
	for (const rule of rules) {
		if (rule.matched !== matched) continue;
		if (rule.requiresBonus === true && !matchedBonus) continue;
		if (rule.requiresBonus === false && matchedBonus) continue;
		// If requiresBonus is undefined, bonus doesn't matter
		prizeTier = rule.tier;
		tierLabel = rule.label;
		break;
	}

	return { matched, matchedBonus, prizeTier, tierLabel };
}
