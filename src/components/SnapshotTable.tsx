import { NumberBalls } from "@/components/NumberBalls";
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

interface SnapshotTableProps {
	snapshots: SnapshotEntry[];
}

const TIER_BADGE: Record<string, string> = {
	"Jackpot 1": "bg-yellow-500 text-white",
	"Jackpot 2": "bg-yellow-400 text-white",
	Jackpot: "bg-yellow-500 text-white",
	"Giải Nhất": "bg-red-500 text-white",
	"Giải Nhì": "bg-orange-500 text-white",
	"Giải Ba": "bg-blue-500 text-white",
	"Giải Tư": "bg-gray-500 text-white",
};

function ResultCell({
	matched,
	tierLabel,
}: {
	matched: number;
	tierLabel: string;
}) {
	if (tierLabel) {
		return (
			<Badge className={`${TIER_BADGE[tierLabel] || ""} text-xs`}>
				{matched}/6 · {tierLabel}
			</Badge>
		);
	}
	return <span className="text-muted-foreground text-xs">{matched}/6</span>;
}

export function SnapshotTable({ snapshots }: SnapshotTableProps) {
	if (snapshots.length === 0) return null;

	const strategyMeta = Object.fromEntries(
		ALL_STRATEGIES.map((s) => [s.key, { name: s.name, emoji: s.emoji }]),
	);
	const strategyKeys = ALL_STRATEGIES.map((s) => s.key);

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="whitespace-nowrap">Kỳ</TableHead>
						<TableHead className="whitespace-nowrap">Ngày</TableHead>
						<TableHead className="whitespace-nowrap">Kết quả</TableHead>
						{strategyKeys.map((key) => (
							<TableHead key={key} className="text-center whitespace-nowrap">
								{strategyMeta[key]?.emoji} {strategyMeta[key]?.name}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{snapshots.map((snap) => (
						<TableRow key={snap.drawId}>
							<TableCell className="font-mono text-xs">
								#{snap.drawId}
							</TableCell>
							<TableCell className="whitespace-nowrap text-xs">
								{snap.drawDate}
							</TableCell>
							<TableCell>
								<NumberBalls
									numbers={snap.actual}
									bonus={snap.actualBonus}
									size="sm"
								/>
							</TableCell>
							{strategyKeys.map((key) => {
								const result = snap.results[key];
								return (
									<TableCell key={key} className="text-center">
										{result ? (
											<ResultCell
												matched={result.matched}
												tierLabel={result.tierLabel}
											/>
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</TableCell>
								);
							})}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
