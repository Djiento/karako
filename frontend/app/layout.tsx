import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karako",
  description:
    "Karako — transforme tes idées en projets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}