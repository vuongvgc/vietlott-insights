import { filterRecentDraws, frequency } from "@/lib/analysis";
import type { Draw, ProductConfig } from "@/lib/types";

interface FrequencyHeatmapProps {
	draws: Draw[];
	config: ProductConfig;
}

export function FrequencyHeatmap({ draws, config }: FrequencyHeatmapProps) {
	const recent = filterRecentDraws(draws, 90);
	const freq = frequency(recent, config);
	const maxCount = Math.max(...freq.values(), 1);
	const [min, max] = config.range;
	const cols = 10;

	const numbers: number[] = [];
	for (let n = min; n <= max; n++) numbers.push(n);

	return (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">
				Tần suất xuất hiện 90 ngày gần nhất ({recent.length} kỳ)
			</p>
			<div
				className="grid gap-1"
				style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
			>
				{numbers.map((n) => {
					const count = freq.get(n) || 0;
					const intensity = count / maxCount;
					// Color: low = gray, high = red
					const bg =
						intensity === 0
							? "bg-muted"
							: intensity < 0.3
								? "bg-orange-100 dark:bg-orange-950"
								: intensity < 0.6
									? "bg-orange-300 dark:bg-orange-800"
									: intensity < 0.8
										? "bg-red-400 dark:bg-red-700"
										: "bg-red-600 dark:bg-red-500 text-white";

					return (
						<div
							key={n}
							className={`${bg} rounded text-center py-1.5 text-xs font-medium transition-colors`}
							title={`Số ${n}: ${count} lần`}
						>
							<div className="font-bold">{n}</div>
							<div className="text-[10px] opacity-70">{count}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
