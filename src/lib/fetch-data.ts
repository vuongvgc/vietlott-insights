import { type Draw, PRODUCTS, ProductConfig, type ProductKey } from "./types";

interface RawDraw {
	date: string;
	id: string;
	result: number[];
}

export async function getDraws(productKey: ProductKey): Promise<Draw[]> {
	const config = PRODUCTS[productKey];
	const res = await fetch(config.url, { next: { revalidate: 3600 } });
	if (!res.ok) throw new Error(`Failed to fetch ${productKey}: ${res.status}`);
	const text = await res.text();
	const lines = text.trim().split("\n");

	const draws: Draw[] = lines
		.map((line) => {
			try {
				const raw: RawDraw = JSON.parse(line);
				const sorted = [...raw.result].sort((a, b) => a - b);

				if (config.hasBonus && raw.result.length >= 7) {
					// Last element in original array is the bonus number
					const bonus = raw.result[raw.result.length - 1];
					const mainNumbers = raw.result.slice(0, 6).sort((a, b) => a - b);
					return {
						date: raw.date,
						id: raw.id,
						numbers: mainNumbers,
						bonus,
					};
				}

				return {
					date: raw.date,
					id: raw.id,
					numbers: sorted.slice(0, 6),
				};
			} catch {
				return null;
			}
		})
		.filter((d): d is Draw => d !== null);

	// Sort by date ascending
	draws.sort((a, b) => a.date.localeCompare(b.date));
	return draws;
}
