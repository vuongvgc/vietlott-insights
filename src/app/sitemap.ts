import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const base = "https://vietlott-insights.vercel.app";
	const lastModified = new Date();

	return [
		{
			url: base,
			lastModified,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${base}/power-655`,
			lastModified,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${base}/mega-645`,
			lastModified,
			changeFrequency: "daily",
			priority: 0.9,
		},
	];
}
