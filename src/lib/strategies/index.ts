import type { Draw, ProductConfig, StrategyDef, Suggestion } from "../types";
import { balancedStrategy } from "./balanced";
import { coldStrategy } from "./cold";
import { cooccurrenceStrategy } from "./cooccurrence";
import { hotStrategy } from "./hot";
import { randomStrategy } from "./random";
import { unpopularStrategy } from "./unpopular";

export const ALL_STRATEGIES: StrategyDef[] = [
	hotStrategy,
	coldStrategy,
	balancedStrategy,
	cooccurrenceStrategy,
	unpopularStrategy,
	randomStrategy,
];

export function runAllStrategies(
	draws: Draw[],
	config: ProductConfig,
): { strategy: StrategyDef; suggestion: Suggestion }[] {
	return ALL_STRATEGIES.map((strategy) => ({
		strategy,
		suggestion: strategy.generate(draws, config),
	}));
}
