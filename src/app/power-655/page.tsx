import type { Metadata } from "next";
import { ProductPage } from "@/components/ProductPage";

export const metadata: Metadata = {
	title: "Power 6/55 — Phân tích tần suất & gợi ý số Vietlott",
	description:
		"Thống kê tần suất, số nóng/lạnh, cặp đi cùng cho Vietlott Power 6/55. Gợi ý bộ 6 số (1–55) theo 6 chiến lược có backtest. Công cụ giải trí miễn phí.",
	alternates: { canonical: "/power-655" },
	openGraph: {
		title: "Power 6/55 — Phân tích tần suất & gợi ý số Vietlott",
		description:
			"Thống kê tần suất, số nóng/lạnh, gợi ý bộ 6 số Power 6/55 theo 6 chiến lược có backtest.",
		url: "/power-655",
	},
};

export default function Power655Page() {
	return <ProductPage productKey="power655" />;
}
