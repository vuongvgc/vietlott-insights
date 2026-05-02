<!-- BEGIN:nextjs-agent-rules -->

# Đây KHÔNG phải Next.js bạn biết

Phiên bản này có breaking changes — API, convention, cấu trúc file có thể khác hoàn toàn so với training data. Đọc hướng dẫn trong `node_modules/next/dist/docs/` trước khi viết code. Chú ý deprecation notices.

<!-- END:nextjs-agent-rules -->

# Vietlott Insights — Hướng dẫn cho AI

## 1. Mục đích & Triết lý

App cá nhân phân tích xổ số Vietlott (Power 6/55, Mega 6/45) và gợi ý bộ số qua 6 chiến lược.

**Nguyên tắc cốt lõi:**

- **Vibe code** — app cá nhân, không phải production enterprise. Ưu tiên đơn giản, ship nhanh.
- **Trung thực về toán** — KHÔNG thuật toán nào thắng được random. UI phải nói rõ điều này. Disclaimer bắt buộc trên mọi trang sản phẩm.
- **Giao diện tiếng Việt** — tất cả text hiển thị cho người dùng bằng tiếng Việt. Code/comments/identifiers bằng tiếng Anh.

---

## 2. Tech Stack (đã chốt — đừng đổi nếu không hỏi user)

| Thành phần      | Chi tiết                                        |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling         | Tailwind CSS v4 + shadcn/ui                     |
| Deploy          | Vercel                                          |
| Dữ liệu         | Fetch JSONL trực tiếp từ GitHub, ISR 1 giờ      |
| Package manager | npm (pnpm/bun KHÔNG có trên máy)                |

**KHÔNG có và KHÔNG cần:** database, cron job, auth, API routes riêng.

---

## 3. Nguồn dữ liệu

- **URL**: `raw.githubusercontent.com/vietvudanh/vietlott-data/main/data/{power655,power645}.jsonl`
- **Repo gốc**: `vietvudanh/vietlott-data` trên GitHub (cập nhật bởi cộng đồng)
- **Format**: JSONL, mỗi dòng là 1 JSON object đại diện 1 kỳ quay
- **Schema `Draw`**: `{ date: string, id: string, numbers: number[], extra?: number }`
- **ISR**: `next: { revalidate: 3600 }` — tự động lấy data mới mỗi giờ khi có request
- **Lưu ý**: file JSONL đôi khi có dòng trống → `fetch-data.ts` đã filter

---

## 4. Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx          # Root layout, lang="vi", metadata, JSON-LD, metadataBase
│   ├── page.tsx            # Redirect → /power-655
│   ├── globals.css         # Tailwind v4 imports
│   ├── sitemap.ts          # Sitemap (3 URL, daily/weekly)
│   ├── robots.ts           # robots.txt (allow all + sitemap link)
│   ├── opengraph-image.tsx # Dynamic OG image root (1200×630, tím gradient)
│   ├── icon.tsx            # Dynamic favicon 32×32 (chữ "V")
│   ├── apple-icon.tsx      # Dynamic Apple Touch Icon 180×180
│   ├── power-655/
│   │   ├── page.tsx        # Trang Power 6/55 (RSC) + per-page metadata
│   │   └── opengraph-image.tsx  # OG image riêng Power 6/55
│   └── mega-645/
│       ├── page.tsx        # Trang Mega 6/45 (RSC) + per-page metadata
│       └── opengraph-image.tsx  # OG image riêng Mega 6/45
├── components/
│   ├── ProductPage.tsx     # Component chính: fetch data → render tất cả sections
│   ├── Nav.tsx             # Thanh điều hướng giữa 2 sản phẩm
│   ├── StrategyCard.tsx    # Card hiển thị 1 chiến lược + bộ số gợi ý
│   ├── NumberBalls.tsx     # Render dãy số dạng bóng tròn
│   ├── FrequencyHeatmap.tsx # Heatmap tần suất xuất hiện
│   ├── BacktestTable.tsx   # Bảng kết quả backtest walk-forward
│   ├── HistoryTable.tsx    # Bảng lịch sử các kỳ quay gần nhất
│   ├── SnapshotSummary.tsx # Bảng tổng kết 6 chiến lược trên snapshot
│   ├── SnapshotTable.tsx   # Chi tiết từng kỳ: gợi ý vs kết quả thực
│   ├── Disclaimer.tsx      # Cảnh báo "đây chỉ là phân tích thống kê"
│   └── ui/                 # shadcn/ui components (button, card, table, badge, separator, tabs)
└── lib/
    ├── types.ts            # ProductConfig, Draw, Suggestion, StrategyDef, BacktestResult, PrizeRule, SnapshotEntry, PRODUCTS map
    ├── fetch-data.ts       # getDraws(productId) — fetch JSONL + ISR
    ├── prizes.ts           # PrizeRules cho Power655/Mega645 + evaluatePrize()
    ├── load-snapshots.ts   # Import static JSON từ data/snapshots/
    ├── analysis.ts         # frequency(), daysSinceLastAppearance(), filterRecentDraws(), topN(), ensureSpread()
    ├── backtest.ts         # walk-forward backtest trên 100 kỳ gần nhất
    └── strategies/
        ├── index.ts        # Barrel export tất cả strategies
        ├── hot.ts          # Số nóng — top tần suất 100 kỳ gần
        ├── cold.ts         # Số lạnh — top daysSinceLastAppearance
        ├── balanced.ts     # Cân bằng — mix hot+cold + ensureSpread
        ├── cooccurrence.ts # Cặp đi cùng — lift trên toàn bộ lịch sử
        ├── unpopular.ts    # Tránh đám đông — né ngày sinh nhật, né liên tiếp
        └── random.ts       # Ngẫu nhiên — seeded mulberry32 RNG, baseline đối chứng

data/
└── snapshots/
    ├── power655.json       # 100 entries snapshot Power 6/55
    └── mega645.json        # 100 entries snapshot Mega 6/45

scripts/
└── snapshot.ts             # Script tạo/cập nhật snapshot (npm run snapshot)

.github/workflows/
└── snapshot.yml            # GitHub Action chạy daily 23:00 VN
```

---

## 5. Sáu chiến lược gợi ý số

Mỗi strategy export `StrategyDef { id, name, description, generate(draws, config) → Suggestion }`.

| File              | Tên tiếng Việt | Logic                                                                  |
| ----------------- | -------------- | ---------------------------------------------------------------------- |
| `hot.ts`          | Số Nóng        | Top tần suất trong 100 kỳ gần nhất                                     |
| `cold.ts`         | Số Lạnh        | Số lâu nhất chưa xuất hiện (daysSinceLastAppearance cao)               |
| `balanced.ts`     | Cân Bằng       | Mix 3 hot + 3 cold, đảm bảo trải đều range (ensureSpread)              |
| `cooccurrence.ts` | Cặp Đi Cùng    | Lift (association rule) trên TOÀN BỘ lịch sử, min-support thích ứng 1% |
| `unpopular.ts`    | Tránh Đám Đông | Né 1–31 (số sinh nhật phổ biến), né cặp liên tiếp                      |
| `random.ts`       | Ngẫu Nhiên     | Fisher-Yates shuffle — baseline trung thực                             |

**Thêm strategy mới**: tạo file trong `src/lib/strategies/`, export `StrategyDef`, thêm vào `index.ts`. `ProductPage.tsx` tự render tất cả strategies từ barrel export.

---

## 6. Sản phẩm xổ số

Định nghĩa trong `PRODUCTS` map tại `src/lib/types.ts`:

| Sản phẩm   | Range | Chọn | Route        |
| ---------- | ----- | ---- | ------------ |
| Power 6/55 | 1–55  | 6 số | `/power-655` |
| Mega 6/45  | 1–45  | 6 số | `/mega-645`  |

**Thêm sản phẩm mới** (vd: Max 3D, Keno): thêm `ProductConfig` vào `PRODUCTS`, tạo route mới trong `src/app/`, cập nhật `Nav.tsx`. Cần kiểm tra repo `vietvudanh/vietlott-data` có data JSONL cho sản phẩm đó không.

---

## 7. Nhật ký quyết định

Ghi lại WHY của các quyết định kiến trúc quan trọng:

| Quyết định                                      | Lý do                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Không dùng database**                         | App cá nhân, data có sẵn trên GitHub. ISR 1h đủ tươi. Thêm DB = thêm infra phải bảo trì → vi phạm triết lý vibe-code.                                                                                                                                                                                                                                        |
| **Fetch JSONL trực tiếp từ GitHub**             | Repo `vietvudanh/vietlott-data` cập nhật đều bởi cộng đồng. Raw URL ổn định, miễn phí, không cần API key.                                                                                                                                                                                                                                                    |
| **ISR 1 giờ thay vì SSG thuần**                 | Data xổ số cập nhật vài lần/tuần. ISR 1h cân bằng giữa tươi mới và performance.                                                                                                                                                                                                                                                                              |
| **RSC (Server Components) cho data fetching**   | Fetch ở server → không ship data-fetching code xuống client. Trang nhẹ hơn.                                                                                                                                                                                                                                                                                  |
| **Co-occurrence dùng toàn bộ lịch sử**          | Ban đầu dùng 300 kỳ gần nhất, nhưng với ~1340 kỳ Power 6/55 thì đủ lớn cho lift ổn định. Min-support 1% (~13 lần) lọc bớt noise do ngẫu nhiên.                                                                                                                                                                                                               |
| **Random strategy làm baseline**                | Trung thực: cho user thấy rằng các strategy khác KHÔNG thực sự tốt hơn random về kỳ vọng. Backtest minh chứng.                                                                                                                                                                                                                                               |
| **Tiếng Việt cho UI**                           | App cá nhân của người Việt, dùng cho bản thân.                                                                                                                                                                                                                                                                                                               |
| **Không dùng client-side fetch**                | Tránh loading state, tránh CORS, tận dụng RSC + ISR.                                                                                                                                                                                                                                                                                                         |
| **Snapshot lưu vào repo + GitHub Action daily** | Cách B (lưu thật) thay vì replay mỗi lần render. Lịch sử cố định dù strategy thay đổi sau. GitHub Action chạy 23:00 VN hàng ngày, commit tự động. Không cần version strategy — tin user.                                                                                                                                                                     |
| **Random dùng seeded RNG (mulberry32)**         | Seed = drawId → deterministic, reproducible trong snapshot. Không dùng Math.random cho snapshot.                                                                                                                                                                                                                                                             |
| **Bonus number cho Power 6/55**                 | JSONL lưu 7 số, số cuối là bonus. `fetch-data.ts` tách `Draw.bonus`. Dùng để phân biệt Jackpot 1/2 và Giải Nhất/Nhì.                                                                                                                                                                                                                                         |
| **SEO cơ bản (dynamic OG, sitemap, JSON-LD)**   | metadataBase = `https://vietlott-insights.vercel.app`. Per-page metadata + canonical. Dynamic OG image qua `next/og` ImageResponse (không cần file tĩnh, không cần font). sitemap.ts + robots.ts theo convention Next.js 16. JSON-LD WebSite ở root layout. Dynamic favicon/apple-icon (chữ "V"). H1 chứa keyword chính. Intro paragraph cho Google snippet. |

---

## 8. Quy ước code

- **Import thẳng** — không tạo file wrapper/re-export. Import trực tiếp từ source.
- **Tiếng Việt cho UI**, tiếng Anh cho code/comments/identifiers.
- **Disclaimer bắt buộc** — hiển thị `<Disclaimer />` trên mọi `ProductPage`.
- **Backtest window = 100 kỳ** — walk-forward, đừng đổi mà không hỏi user.
- **shadcn/ui** — thêm component bằng `npx shadcn@latest add <tên>`. Tự cài vào `src/components/ui/`.
- **Không `"use client"` trừ khi thực sự cần** — giữ RSC mặc định.

---

## 9. Lệnh thường dùng

```bash
npm run dev           # Dev server (http://localhost:3000)
npx next build        # Build production — CHẠY TRƯỚC KHI BÁO "XONG"
npm run snapshot      # Tạo/cập nhật snapshot so sánh chiến lược (cũng chạy tự động qua GitHub Action)
npx shadcn@latest add <component>  # Thêm shadcn UI component
```

---

## 10. Việc chưa làm / Ý tưởng tương lai

- [ ] Push lên GitHub cá nhân (chưa có remote, chưa chọn email/auth)
- [ ] Kết nối Vercel deploy
- [ ] Filter theo khoảng thời gian kỳ quay
- [ ] Export gợi ý ra CSV
- [ ] Share link bộ số
- [ ] Thêm sản phẩm: Max 3D, Keno (nếu có data JSONL)
- [ ] Dark mode
- [x] ~~So sánh kết quả chiến lược theo thời gian~~ → đã triển khai qua Snapshot (SnapshotSummary + SnapshotTable)
- [x] ~~SEO cơ bản~~ → metadata, OG image, sitemap, robots, JSON-LD, favicon, on-page optimization

---

## 11. Cạm bẫy đã gặp (Gotchas)

- **Next.js 16 breaking changes** — đọc `node_modules/next/dist/docs/` khi nghi ngờ API.
- **pnpm/bun không có** trên máy → luôn dùng `npm`.
- **`gh` CLI chưa cài** — push bằng git thuần (HTTPS PAT hoặc SSH).
- **Dòng trống trong JSONL** — `fetch-data.ts` đã filter, nhưng nếu thêm parser mới thì nhớ handle.
- **Co-occurrence dùng toàn bộ lịch sử** — KHÔNG quay lại `slice(-300)`.
- **`git config user.email`** đang là email công ty (`@manabie.com`) — cần đổi trước khi push lên repo cá nhân.
- **Snapshot JSON files** (`data/snapshots/*.json`) được GitHub Action commit tự động. KHÔNG sửa tay. Muốn reset → xóa file → chạy `npm run snapshot`.
- **Random strategy trong snapshot** dùng seeded RNG (seed = drawId). KHÔNG đổi hash function nếu muốn snapshot cũ reproducible.
- **metadataBase** hardcoded `https://vietlott-insights.vercel.app`. Nếu đổi domain → sửa trong `layout.tsx`, `sitemap.ts`, `robots.ts`.
- **OG image dùng ImageResponse** — chỉ hỗ trợ subset CSS (flexbox, không grid). Xem https://og-playground.vercel.app nếu cần debug layout.
- **GSC verification** — field `verification.google` trong `layout.tsx` đang comment out. Paste token sau khi tạo property trong Google Search Console.

---

## 12. Điều KHÔNG được làm

- ❌ Hứa "thuật toán này tăng tỷ lệ trúng" — **sai về toán học**
- ❌ Thêm database hoặc cron — vi phạm triết lý vibe-code
- ❌ Dùng client-side fetch cho draws — dùng RSC + ISR
- ❌ Đổi tên file/route mà không cập nhật `Nav.tsx`
- ❌ Xóa hoặc ẩn `<Disclaimer />` — bắt buộc hiển thị
- ❌ Dùng `pnpm` hoặc `bun` — không có trên máy
- ❌ `git add .` — chỉ stage file cụ thể đã sửa
