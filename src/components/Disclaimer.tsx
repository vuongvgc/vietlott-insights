export function Disclaimer() {
	return (
		<div className="border-t mt-12 pt-6 pb-8 text-center text-xs text-muted-foreground space-y-2">
			<p className="font-medium">⚠️ Miễn trừ trách nhiệm</p>
			<p>
				Đây là công cụ phân tích thống kê và giải trí. Không có thuật toán nào
				thực sự tăng xác suất trúng xổ số — mỗi bộ số đều có xác suất bằng nhau.
				Bảng so sánh chiến lược là replay trên dữ liệu lịch sử, KHÔNG phải kết
				quả đặt cược thực tế. Dữ liệu từ{" "}
				<a
					href="https://github.com/vietvudanh/vietlott-data"
					className="underline"
					target="_blank"
					rel="noopener"
				>
					vietvudanh/vietlott-data
				</a>
				. Dành cho người trên 18 tuổi.
			</p>
		</div>
	);
}
