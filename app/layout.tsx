import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lerry Animasi Production Office",
  description: "Kantor produksi dan dashboard tim untuk workflow YouTube Shorts Lerry Animasi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
