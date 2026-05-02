# 🎰 Vietlott Insights

Phân tích thống kê & gợi ý bộ số Power 6/55, Mega 6/45 theo nhiều chiến lược.

> ⚠️ **Disclaimer**: Đây là công cụ thống kê và giải trí. Không có thuật toán nào thực sự tăng xác suất trúng xổ số — mỗi bộ số đều có xác suất bằng nhau. Dành cho người trên 18 tuổi.

## Tính năng

- 📊 Heatmap tần suất xuất hiện từng số (90 ngày gần nhất)
- 🔮 6 chiến lược gợi ý bộ số (xem chi tiết bên dưới)
- 📈 Backtest walk-forward 100 kỳ — so sánh hiệu quả từng chiến lược vs Random
- 📋 Lịch sử 30 kỳ quay gần nhất
- 🔄 Dữ liệu tự cập nhật mỗi 1 giờ (ISR) từ [vietvudanh/vietlott-data](https://github.com/vietvudanh/vietlott-data)

## 6 Chiến lược chọn số

### 🔥 Số Nóng (Hot Frequency)

Chọn 6 số xuất hiện **nhiều nhất**, kết hợp trọng số giữa tần suất 90 ngày gần đây (×0.6) và toàn thời gian (×0.4).

**Cơ sở**: Nếu viên bi hoặc máy quay có thiên lệch vật lý nhỏ (bias), số nào ra nhiều trong quá khứ có thể tiếp tục ra nhiều.

**Hạn chế**: Xổ số được kiểm định nghiêm ngặt, bias gần như không tồn tại. Chiến lược này chủ yếu mang tính tâm lý.

---

### ❄️ Số Lạnh (Cold / Overdue)

Chọn 6 số **lâu nhất chưa xuất hiện** (days since last appearance lớn nhất).

**Cơ sở**: Lý thuyết "đến lượt" (gambler's fallacy) — nhiều người tin rằng số lâu chưa ra sẽ "phải ra".

**Hạn chế**: Đây chính xác là **ngụy biện của người đánh bạc**. Mỗi kỳ quay là độc lập, số lạnh không có xác suất cao hơn. Tuy nhiên vẫn phổ biến trong cộng đồng soi cầu.

---

### ⚖️ Cân Bằng (Balanced)

Kết hợp **3 số nóng + 3 số lạnh**, đồng thời đảm bảo phân bổ đều trên 4 phần tư của dải số (1-14, 15-28, 29-41, 42-55 với Power 6/55).

**Cơ sở**: Tránh chọn toàn bộ số trong một cụm nhỏ. Kết quả xổ số thực tế thường phân bổ rải đều trên dải số hơn là tập trung.

**Hạn chế**: Không tăng xác suất trúng, nhưng tạo ra bộ số "nhìn hợp lý" hơn.

---

### 🔗 Cặp Số Hay Đi Cùng (Co-occurrence)

Phân tích **toàn bộ lịch sử** (~1340+ kỳ Power 6/55, ~1307+ kỳ Mega 6/45) để tìm **các cặp số thường xuất hiện cùng nhau** (dùng chỉ số lift từ association rule mining). Sau đó mở rộng greedy: thêm từng số có tổng co-occurrence cao nhất với bộ đã chọn.

**Thuật toán**:

1. Xây ma trận co-occurrence cho tất cả cặp (i, j)
2. Tính lift = P(i ∩ j) / (P(i) × P(j)) — lọc cặp có lift cao và ≥3 lần xuất hiện
3. Bắt đầu từ cặp có lift cao nhất
4. Greedy thêm số có tổng pair-count cao nhất với bộ hiện tại

**Cơ sở**: Nếu có hidden pattern nào trong máy quay, co-occurrence sẽ phát hiện. Trong thực tế, lift của hầu hết cặp ≈ 1.0 (không có pattern).

**Hạn chế**: Dù dùng toàn bộ lịch sử (~1340 kỳ × 15 cặp/kỳ ≈ 20,100 quan sát), lift cao vẫn có thể do ngẫu nhiên. Áp dụng ngưỡng min-support thích ứng (1% số kỳ) để lọc bớt noise.

---

### ⭐ Số Ít Người Chọn (Unpopular) — _Chiến lược duy nhất có cơ sở toán học_

Chọn số mà **ít người khác chọn**, nhằm **giảm xác suất chia giải** nếu trúng:

- Loại số 1-31 (nhiều người chọn theo ngày sinh)
- Loại bội của 5 (số tròn — tâm lý thích số đẹp)
- Tránh 3+ số liên tiếp (pattern phổ biến khi người ta chọn "chuỗi")

**Cơ sở toán học thực sự**: Xác suất trúng jackpot không đổi (~1/29 triệu với Power 6/55), nhưng **kỳ vọng tiền thưởng (expected value) thay đổi** tùy bao nhiêu người cùng chọn bộ số đó. Nếu bạn chọn bộ số ít người chọn → khi trúng, ít chia giải hơn → EV cao hơn.

Đây là chiến lược duy nhất được chứng minh trong lý thuyết trò chơi (game theory). Các nghiên cứu tại UK National Lottery và EuroMillions đều xác nhận hiệu ứng này.

**Hạn chế**: Chỉ tối ưu EV khi trúng, không tăng P(trúng). Và bạn vẫn phải trúng đã.

---

### 🎲 Ngẫu Nhiên (Random Control)

Chọn **hoàn toàn ngẫu nhiên** 6 số trong dải.

**Mục đích**: Làm **baseline** để so sánh với 5 chiến lược trên. Nếu backtest cho thấy mọi chiến lược đều cho avg match ≈ Random → chứng minh không chiến lược nào thực sự tốt hơn. Đây là tín hiệu trung thực (honest signal) quan trọng nhất của ứng dụng.

---

## So sánh nhanh

| Chiến lược       | Tăng P(trúng)? | Tăng EV khi trúng? | Cơ sở toán học?           | Độ phức tạp |
| ---------------- | -------------- | ------------------ | ------------------------- | ----------- |
| 🔥 Hot           | ❌             | ❌                 | Không                     | Thấp        |
| ❄️ Cold          | ❌             | ❌                 | Không (gambler's fallacy) | Thấp        |
| ⚖️ Balanced      | ❌             | ❌                 | Yếu                       | Trung bình  |
| 🔗 Co-occurrence | ❌             | ❌                 | Yếu (noise vs signal)     | Cao         |
| ⭐ Unpopular     | ❌             | ✅                 | **Có (game theory)**      | Trung bình  |
| 🎲 Random        | ❌             | ❌                 | Baseline                  | Không       |

> **Kết luận**: Nếu bạn chỉ chọn 1 chiến lược, hãy chọn **⭐ Unpopular** — nó không giúp bạn trúng nhiều hơn, nhưng nếu trúng thì tiền thưởng kỳ vọng cao hơn.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router, Server Components, ISR)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- Deploy trên [Vercel](https://vercel.com/)
- Dữ liệu từ [vietvudanh/vietlott-data](https://github.com/vietvudanh/vietlott-data) (MIT License)

## Kiến trúc

```
Browser → Vercel Edge (ISR 1h)
           ↓
       Server Component
           ↓
       fetch raw.githubusercontent.com/.../power655.jsonl
           ↓
       Parse JSONL → Run 6 strategies + Backtest (in RAM)
           ↓
       Render HTML → Cache 1h
```

Không database, không cron, không backend riêng. Mỗi lần Vercel revalidate (1h), nó fetch JSONL mới nhất từ GitHub (repo `vietvudanh/vietlott-data` tự cập nhật hàng ngày bằng GitHub Actions).

## Chạy local

```bash
npm install
npm run dev
# Mở http://localhost:3000
```

## Deploy

Push lên GitHub → connect Vercel → auto deploy. Không cần env var.

## License

MIT
