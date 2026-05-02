"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "vietlott-disclaimer-ack";

export function DisclaimerModal() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!sessionStorage.getItem(STORAGE_KEY)) {
			setOpen(true);
		}
	}, []);

	function handleAccept() {
		sessionStorage.setItem(STORAGE_KEY, "1");
		setOpen(false);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				// Only allow closing via the accept button
				if (!nextOpen) return;
			}}
			modal
		>
			<DialogContent showCloseButton={false} className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-center text-lg">
						⚠️ Miễn trừ trách nhiệm
					</DialogTitle>
					<DialogDescription className="space-y-3 pt-2 text-center">
						<p>
							App này chỉ dựa trên <strong>phân tích thống kê lịch sử</strong> —
							không có thuật toán nào thực sự tăng xác suất trúng xổ số. Mỗi bộ
							số đều có xác suất bằng nhau.
						</p>
						<p>
							Các gợi ý ở đây <strong>chỉ để tham khảo và giải trí</strong>,
							không đảm bảo trúng thưởng. Mọi quyết định mua vé là của riêng
							bạn.
						</p>
						<p className="text-xs text-muted-foreground/70">
							Dành cho người trên 18 tuổi.
						</p>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={handleAccept} className="w-full sm:w-auto">
						Tôi hiểu
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
