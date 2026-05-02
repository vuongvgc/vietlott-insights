import { ImageResponse } from "next/og";

export const alt = "Power 6/55 — Phân tích tần suất & gợi ý số Vietlott";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SAMPLE_NUMBERS = [3, 17, 28, 36, 44, 55];

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
					"linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #7c3aed 100%)",
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
				🎱 Power 6/55
			</div>
			<div
				style={{
					fontSize: 26,
					opacity: 0.9,
					marginBottom: 40,
					display: "flex",
				}}
			>
				Phân tích tần suất & gợi ý số Vietlott
			</div>
			<div style={{ display: "flex", gap: 16 }}>
				{SAMPLE_NUMBERS.map((n) => (
					<div
						key={n}
						style={{
							width: 72,
							height: 72,
							borderRadius: 36,
							background: "linear-gradient(135deg, #f59e0b, #ef4444)",
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
				Chọn 6 số từ 1–55 · 6 chiến lược · Backtest 100 kỳ
			</div>
		</div>,
		{ ...size },
	);
}
