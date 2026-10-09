import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "walky talky",
  description:
    "Oyunlaştırılmış dersler, eğlenceli alıştırmalar ve motivasyon ödülleriyle her gün biraz daha ilerle.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={`${nunito.className} antialiased`}>{children}</body>
    </html>
  );
}
