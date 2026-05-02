import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { StrategyDef, Suggestion } from "@/lib/types";
import { NumberBalls } from "./NumberBalls";

interface StrategyCardProps {
	strategy: StrategyDef;
	suggestion: Suggestion;
}

export function StrategyCard({ strategy, suggestion }: StrategyCardProps) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-lg flex items-center gap-2">
					<span>{strategy.emoji}</span>
					<span>{strategy.name}</span>
				</CardTitle>
				<CardDescription>{strategy.description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<NumberBalls numbers={suggestion.numbers} size="lg" />
				<ul className="text-xs text-muted-foreground space-y-1">
					{suggestion.rationale.map((r, i) => (
						<li key={i}>• {r}</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
