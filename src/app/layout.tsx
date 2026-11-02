import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Noto_Serif, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import "./anime.css";
import "./fantasy.css";
import "./readability.css";
import "./guest-experience.css";
import "./cinematic.css";

const vietnameseSans = Be_Vietnam_Pro({
  variable: "--font-vietnamese-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  preload: false,
  display: "swap",
});

const vietnameseSerif = Noto_Serif({
  variable: "--font-vietnamese-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  preload: false,
  display: "swap",
});

const japaneseSerif = Noto_Serif_JP({
  variable: "--font-japanese-serif",
  weight: ["400", "500"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "青春の最後のページ — Trang cuối của thanh xuân",
  description:
    "Lời mời dự lễ tốt nghiệp của Trần Viết Quang tại FPT University — một ngày đáng nhớ, một chương mới bắt đầu.",
  openGraph: {
    title: "青春の最後のページ — The Last Page of Youth",
    description: "Một lời mời nhỏ cho một ngày thật đáng nhớ.",
    type: "website",
    locale: "vi_VN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#9ccde9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${vietnameseSans.variable} ${vietnameseSerif.variable} ${japaneseSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
