import Link from "next/link";
import { PRODUCTS, type ProductKey } from "@/lib/types";

interface NavProps {
	active: ProductKey;
}

export function Nav({ active }: NavProps) {
	return (
		<nav className="border-b">
			<div className="container mx-auto px-4 flex items-center gap-6 h-14">
				<Link href="/" className="font-bold text-lg">
					Vietlott Insights
				</Link>
				<div className="flex gap-4">
					{Object.values(PRODUCTS).map((p) => (
						<Link
							key={p.key}
							href={`/${p.slug}`}
							className={`text-sm transition-colors hover:text-foreground ${
								active === p.key
									? "text-foreground font-medium"
									: "text-muted-foreground"
							}`}
						>
							{p.label}
						</Link>
					))}
				</div>
			</div>
		</nav>
	);
}
