import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Draw } from "@/lib/types";
import { NumberBalls } from "./NumberBalls";

interface HistoryTableProps {
	draws: Draw[];
	limit?: number;
}

export function HistoryTable({ draws, limit = 20 }: HistoryTableProps) {
	const recent = [...draws].reverse().slice(0, limit);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-24">Kỳ</TableHead>
					<TableHead className="w-28">Ngày</TableHead>
					<TableHead>Kết quả</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{recent.map((d) => (
					<TableRow key={d.id}>
						<TableCell className="font-mono text-sm">#{d.id}</TableCell>
						<TableCell className="text-sm">{d.date}</TableCell>
						<TableCell>
							<NumberBalls numbers={d.numbers} bonus={d.bonus} size="sm" />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
