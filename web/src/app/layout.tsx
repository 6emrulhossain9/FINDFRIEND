import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ViCo — Make friends around the world",
    template: "%s · ViCo",
  },
  description:
    "A global friend-making social network. Meet people your age who share your interests.",
  openGraph: {
    title: "ViCo — Make friends around the world",
    description:
      "A global friend-making social network. Meet people your age who share your interests.",
    siteName: "ViCo",
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
