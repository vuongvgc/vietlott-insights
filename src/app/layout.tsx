import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = 'https://vietlott-insights.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Vietlott Insights — Phân tích & thống kê xổ số Power 6/55, Mega 6/45',
    template: '%s | Vietlott Insights',
  },
  description:
    'Phân tích thống kê tần suất, số nóng/lạnh, co-occurrence cho Vietlott Power 6/55 và Mega 6/45. Backtest 6 chiến lược gợi ý số. Công cụ giải trí miễn phí.',
  keywords: [
    'Vietlott',
    'Power 6/55',
    'Mega 6/45',
    'phân tích xổ số',
    'thống kê xổ số',
    'số nóng',
    'số lạnh',
    'tần suất Vietlott',
  ],
  authors: [{ name: 'Vietlott Insights' }],
  applicationName: 'Vietlott Insights',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Vietlott Insights',
    url: '/',
    title: 'Vietlott Insights — Phân tích & thống kê xổ số',
    description:
      'Phân tích thống kê tần suất, gợi ý số Power 6/55 & Mega 6/45 theo 6 chiến lược. Miễn phí, trung thực, có backtest.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vietlott Insights — Phân tích & thống kê xổ số',
    description:
      'Thống kê tần suất, số nóng/lạnh, gợi ý bộ số Vietlott. Backtest 6 chiến lược.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    // google: "PASTE_GSC_TOKEN_HERE",
  },
  category: 'entertainment',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Vietlott Insights',
  url: SITE_URL,
  inLanguage: 'vi-VN',
  description:
    'Phân tích thống kê xổ số Vietlott Power 6/55, Mega 6/45 và gợi ý bộ số theo 6 chiến lược.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='vi'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='min-h-full flex flex-col'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
