import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: 180,
				height: 180,
				borderRadius: 36,
				background: "linear-gradient(135deg, #312e81, #7c3aed)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: 100,
				fontWeight: 700,
				color: "white",
				fontFamily: "sans-serif",
			}}
		>
			V
		</div>,
		{ ...size },
	);
}
