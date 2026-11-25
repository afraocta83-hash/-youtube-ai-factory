import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lerry Animasi Studio",
  description: "Studio produksi YouTube Shorts untuk karakter Lerry dan Ayah.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
