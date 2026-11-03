import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Friendnet — Find your people",
    template: "%s · Friendnet",
  },
  description:
    "Meet kind, interesting people around the world through shared interests and real conversation.",
  openGraph: {
    title: "Friendnet — Find your people",
    description: "Meet kind, interesting people around the world through shared interests and real conversation.",
    siteName: "Friendnet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface text-text-main">
        {children}
      </body>
    </html>
  );
}
