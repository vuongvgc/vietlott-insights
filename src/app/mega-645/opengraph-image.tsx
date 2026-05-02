import { ImageResponse } from "next/og";

export const alt = "Mega 6/45 — Thống kê & gợi ý bộ số Vietlott";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SAMPLE_NUMBERS = [5, 12, 21, 29, 37, 45];

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				background:
					"linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
				fontFamily: "sans-serif",
				color: "white",
			}}
		>
			<div
				style={{
					fontSize: 56,
					fontWeight: 700,
					marginBottom: 12,
					display: "flex",
				}}
			>
				🎱 Mega 6/45
			</div>
			<div
				style={{
					fontSize: 26,
					opacity: 0.9,
					marginBottom: 40,
					display: "flex",
				}}
			>
				Thống kê & gợi ý bộ số Vietlott
			</div>
			<div style={{ display: "flex", gap: 16 }}>
				{SAMPLE_NUMBERS.map((n) => (
					<div
						key={n}
						style={{
							width: 72,
							height: 72,
							borderRadius: 36,
							background: "linear-gradient(135deg, #10b981, #06b6d4)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 32,
							fontWeight: 700,
							color: "white",
							boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
						}}
					>
						{n}
					</div>
				))}
			</div>
			<div
				style={{ fontSize: 18, opacity: 0.6, marginTop: 44, display: "flex" }}
			>
				Chọn 6 số từ 1–45 · 6 chiến lược · Backtest 100 kỳ
			</div>
		</div>,
		{ ...size },
	);
}
