import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lerry Clipper — YouTube Shorts Studio",
  description: "Tempel link video, proses menjadi klip vertikal, dan tinjau hasil sebelum publikasi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
