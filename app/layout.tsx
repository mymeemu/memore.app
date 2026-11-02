
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEMORE — Cultive seus hábitos",
  description: "Cultive seus hábitos. Evolua seu pet.",
  applicationName: "MEMORE",
  manifest: "/manifest.json",
  themeColor: "#8257FF"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
