import { BacktestTable } from "@/components/BacktestTable";
import { Disclaimer } from "@/components/Disclaimer";
import { FrequencyHeatmap } from "@/components/FrequencyHeatmap";
import { HistoryTable } from "@/components/HistoryTable";
import { Nav } from "@/components/Nav";
import { NumberBalls } from "@/components/NumberBalls";
import { StrategyCard } from "@/components/StrategyCard";
import { Separator } from "@/components/ui/separator";
import { backtestAll } from "@/lib/backtest";
import { getDraws } from "@/lib/fetch-data";
import { ALL_STRATEGIES, runAllStrategies } from "@/lib/strategies";
import { PRODUCTS, ProductConfig, type ProductKey } from "@/lib/types";

interface ProductPageProps {
	productKey: ProductKey;
}

export async function ProductPage({ productKey }: ProductPageProps) {
	const config = PRODUCTS[productKey];
	const draws = await getDraws(productKey);
	const lastDraw = draws[draws.length - 1];

	const suggestions = runAllStrategies(draws, config);
	const backtestResults = backtestAll(draws, ALL_STRATEGIES, config, 100);

	return (
		<div className="min-h-screen bg-background">
			<Nav active={productKey} />
			<main className="container mx-auto px-4 py-8 space-y-10 max-w-5xl">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold">{config.label}</h1>
					<p className="text-muted-foreground mt-1">
						Quay {config.drawDays} · Chọn {config.pick} số từ {config.range[0]}-
						{config.range[1]}
					</p>
				</div>

				{/* Latest draw */}
				{lastDraw && (
					<section className="space-y-2">
						<h2 className="text-xl font-semibold">
							Kỳ gần nhất: #{lastDraw.id} · {lastDraw.date}
						</h2>
						<NumberBalls
							numbers={lastDraw.numbers}
							bonus={lastDraw.bonus}
							size="lg"
						/>
						<p className="text-sm text-muted-foreground">
							Tổng cộng {draws.length} kỳ quay từ {draws[0].date}
						</p>
					</section>
				)}

				<Separator />

				{/* Strategy suggestions */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold">
						Gợi ý cho kỳ tiếp theo (6 chiến lược)
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{suggestions.map(({ strategy, suggestion }) => (
							<StrategyCard
								key={strategy.key}
								strategy={strategy}
								suggestion={suggestion}
							/>
						))}
					</div>
				</section>

				<Separator />

				{/* Frequency heatmap */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Heatmap tần suất</h2>
					<FrequencyHeatmap draws={draws} config={config} />
				</section>

				<Separator />

				{/* Backtest */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold">
						Backtest 100 kỳ — So sánh chiến lược
					</h2>
					<p className="text-sm text-muted-foreground">
						Với mỗi kỳ, dùng dữ liệu trước đó để sinh gợi ý, rồi so với kết quả
						thực. Nếu mọi chiến lược ≈ Random → không có chiến lược nào thực sự
						tốt hơn ngẫu nhiên.
					</p>
					<BacktestTable results={backtestResults} />
				</section>

				<Separator />

				{/* History */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold">Lịch sử 30 kỳ gần nhất</h2>
					<HistoryTable draws={draws} limit={30} />
				</section>

				<Disclaimer />
			</main>
		</div>
	);
}
