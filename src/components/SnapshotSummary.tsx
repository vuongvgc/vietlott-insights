import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ALL_STRATEGIES } from "@/lib/strategies";
import type { SnapshotEntry } from "@/lib/types";

interface SnapshotSummaryProps {
	snapshots: SnapshotEntry[];
}

const TIER_COLORS: Record<string, string> = {
	"Jackpot 1": "bg-yellow-500 text-white",
	"Jackpot 2": "bg-yellow-400 text-white",
	Jackpot: "bg-yellow-500 text-white",
	"Giải Nhất": "bg-red-500 text-white",
	"Giải Nhì": "bg-orange-500 text-white",
	"Giải Ba": "bg-blue-500 text-white",
	"Giải Tư": "bg-gray-500 text-white",
};

export function SnapshotSummary({ snapshots }: SnapshotSummaryProps) {
	if (snapshots.length === 0) return null;

	const strategyKeys = ALL_STRATEGIES.map((s) => s.key);
	const strategyNames = Object.fromEntries(
		ALL_STRATEGIES.map((s) => [s.key, { name: s.name, emoji: s.emoji }]),
	);

	// Aggregate per strategy
	const summary = strategyKeys.map((key) => {
		let prizeCount = 0;
		const tierCounts: Record<string, number> = {};
		let bestTier = "";

		for (const snap of snapshots) {
			const result = snap.results[key];
			if (!result) continue;
			if (result.prizeTier) {
				prizeCount++;
				tierCounts[result.tierLabel] = (tierCounts[result.tierLabel] || 0) + 1;
				if (!bestTier || tierRank(result.tierLabel) < tierRank(bestTier)) {
					bestTier = result.tierLabel;
				}
			}
		}

		return {
			key,
			name: strategyNames[key]?.name || key,
			emoji: strategyNames[key]?.emoji || "",
			prizeCount,
			tierCounts,
			bestTier,
			rate: ((prizeCount / snapshots.length) * 100).toFixed(0),
		};
	});

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Chiến lược</TableHead>
					<TableHead className="text-center">Trúng giải</TableHead>
					<TableHead className="text-center">Tỷ lệ</TableHead>
					<TableHead className="text-center">Giải cao nhất</TableHead>
					<TableHead>Chi tiết</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{summary.map((s) => (
					<TableRow key={s.key}>
						<TableCell className="font-medium">
							{s.emoji} {s.name}
						</TableCell>
						<TableCell className="text-center">
							{s.prizeCount}/{snapshots.length}
						</TableCell>
						<TableCell className="text-center">{s.rate}%</TableCell>
						<TableCell className="text-center">
							{s.bestTier ? (
								<Badge className={TIER_COLORS[s.bestTier] || ""}>
									{s.bestTier}
								</Badge>
							) : (
								<span className="text-muted-foreground">—</span>
							)}
						</TableCell>
						<TableCell>
							<div className="flex flex-wrap gap-1">
								{Object.entries(s.tierCounts).map(([tier, count]) => (
									<Badge key={tier} variant="outline" className="text-xs">
										{tier}: {count}
									</Badge>
								))}
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

// Lower = better
function tierRank(tier: string): number {
	const order = [
		"Jackpot 1",
		"Jackpot",
		"Jackpot 2",
		"Giải Nhất",
		"Giải Nhì",
		"Giải Ba",
		"Giải Tư",
	];
	const idx = order.indexOf(tier);
	return idx >= 0 ? idx : 999;
}
