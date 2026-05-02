interface NumberBallsProps {
	numbers: number[];
	bonus?: number;
	size?: "sm" | "md" | "lg";
}

const sizeClasses = {
	sm: "w-8 h-8 text-xs",
	md: "w-10 h-10 text-sm",
	lg: "w-12 h-12 text-base",
};

export function NumberBalls({ numbers, bonus, size = "md" }: NumberBallsProps) {
	return (
		<div className="flex items-center gap-2 flex-wrap">
			{numbers.map((n, i) => (
				<span
					key={i}
					className={`${sizeClasses[size]} rounded-full bg-red-500 text-white font-bold flex items-center justify-center shadow-md`}
				>
					{n}
				</span>
			))}
			{bonus !== undefined && (
				<>
					<span className="text-muted-foreground font-bold">+</span>
					<span
						className={`${sizeClasses[size]} rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center shadow-md`}
					>
						{bonus}
					</span>
				</>
			)}
		</div>
	);
}
