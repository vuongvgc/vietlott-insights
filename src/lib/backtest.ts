import type { BacktestResult, Draw, ProductConfig, StrategyDef } from "./types";

/**
 * Walk-forward backtest: for each of the last N draws,
 * use all prior draws to generate a suggestion, then count matches.
 */
export function backtest(
	draws: Draw[],
	strategy: StrategyDef,
	config: ProductConfig,
	n: number = 100,
): BacktestResult {
	const startIdx = Math.max(50, draws.length - n); // need at least 50 draws for analysis
	const distribution: Record<number, number> = {};
	for (let i = 0; i <= config.pick; i++) distribution[i] = 0;

	let totalMatches = 0;
	let count = 0;

	for (let i = startIdx; i < draws.length; i++) {
		const history = draws.slice(0, i);
		const actual = new Set(draws[i].numbers);

		try {
			const suggestion = strategy.generate(history, config);
			const matches = suggestion.numbers.filter((n) => actual.has(n)).length;
			distribution[matches] = (distribution[matches] || 0) + 1;
			totalMatches += matches;
			count++;
		} catch {
			// Strategy may fail with too few draws, skip
		}
	}

	return {
		strategyKey: strategy.key,
		avgMatch: count > 0 ? totalMatches / count : 0,
		distribution,
		total: count,
	};
}

/**
 * Run backtest for all strategies.
 * Skip random (non-deterministic) — run it once and label as baseline.
 */
export function backtestAll(
	draws: Draw[],
	strategies: StrategyDef[],
	config: ProductConfig,
	n: number = 100,
): BacktestResult[] {
	return strategies.map((s) => backtest(draws, s, config, n));
}
