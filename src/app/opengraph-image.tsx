import { ImageResponse } from "next/og";

export const alt = "Vietlott Insights — Phân tích & thống kê xổ số";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SAMPLE_NUMBERS = [7, 14, 23, 31, 42, 55];

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
					"linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
				fontFamily: "sans-serif",
				color: "white",
			}}
		>
			<div
				style={{
					fontSize: 64,
					fontWeight: 700,
					marginBottom: 16,
					display: "flex",
				}}
			>
				🎱 Vietlott Insights
			</div>
			<div
				style={{
					fontSize: 28,
					opacity: 0.9,
					marginBottom: 48,
					display: "flex",
				}}
			>
				Phân tích & thống kê Power 6/55, Mega 6/45
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
				style={{
					fontSize: 18,
					opacity: 0.6,
					marginTop: 48,
					display: "flex",
				}}
			>
				Công cụ giải trí — không đảm bảo trúng thưởng
			</div>
		</div>,
		{ ...size },
	);
}
