import type { Metadata } from "next";
import { ProductPage } from "@/components/ProductPage";

export const metadata: Metadata = {
	title: "Mega 6/45 — Thống kê & gợi ý bộ số Vietlott",
	description:
		"Thống kê tần suất, số nóng/lạnh, cặp đi cùng cho Vietlott Mega 6/45. Gợi ý bộ 6 số (1–45) theo 6 chiến lược có backtest. Công cụ giải trí miễn phí.",
	alternates: { canonical: "/mega-645" },
	openGraph: {
		title: "Mega 6/45 — Thống kê & gợi ý bộ số Vietlott",
		description:
			"Thống kê tần suất, gợi ý bộ 6 số Mega 6/45 theo 6 chiến lược có backtest.",
		url: "/mega-645",
	},
};

export default function Mega645Page() {
	return <ProductPage productKey="mega645" />;
}
