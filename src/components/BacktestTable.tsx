import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ALL_STRATEGIES } from "@/lib/strategies";
import type { BacktestResult } from "@/lib/types";

interface BacktestTableProps {
	results: BacktestResult[];
}

export function BacktestTable({ results }: BacktestTableProps) {
	// Sort by avgMatch desc
	const sorted = [...results].sort((a, b) => b.avgMatch - a.avgMatch);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Chiến lược</TableHead>
					<TableHead className="text-right">Avg Match</TableHead>
					<TableHead className="text-right">0 số</TableHead>
					<TableHead className="text-right">1 số</TableHead>
					<TableHead className="text-right">2 số</TableHead>
					<TableHead className="text-right">3+ số</TableHead>
					<TableHead className="text-right">Số kỳ test</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sorted.map((r) => {
					const strat = ALL_STRATEGIES.find((s) => s.key === r.strategyKey);
					const threeOrMore = Object.entries(r.distribution)
						.filter(([k]) => Number(k) >= 3)
						.reduce((sum, [, v]) => sum + v, 0);
					const isBaseline = r.strategyKey === "random";

					return (
						<TableRow
							key={r.strategyKey}
							className={isBaseline ? "bg-muted/50 font-medium" : ""}
						>
							<TableCell>
								{strat?.emoji} {strat?.name}
								{isBaseline && (
									<span className="ml-2 text-xs text-muted-foreground">
										(baseline)
									</span>
								)}
							</TableCell>
							<TableCell className="text-right font-mono">
								{r.avgMatch.toFixed(2)}
							</TableCell>
							<TableCell className="text-right font-mono">
								{r.distribution[0] || 0}
							</TableCell>
							<TableCell className="text-right font-mono">
								{r.distribution[1] || 0}
							</TableCell>
							<TableCell className="text-right font-mono">
								{r.distribution[2] || 0}
							</TableCell>
							<TableCell className="text-right font-mono">
								{threeOrMore}
							</TableCell>
							<TableCell className="text-right font-mono">{r.total}</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
