import mega645Data from "../../data/snapshots/mega645.json";

// Static imports so Next.js can bundle these at build time
import power655Data from "../../data/snapshots/power655.json";
import type { ProductKey, SnapshotEntry } from "./types";

const DATA: Record<ProductKey, SnapshotEntry[]> = {
	power655: power655Data as SnapshotEntry[],
	mega645: mega645Data as SnapshotEntry[],
};

export function getSnapshots(productKey: ProductKey): SnapshotEntry[] {
	return DATA[productKey] || [];
}
