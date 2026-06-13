import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://activasalida.com"),
  title: "activasalida · Tu proximo plan empieza aca",
  description:
    "Planes presenciales con gente que ya sabes quien es. Sin grupo de WhatsApp.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "activasalida",
  },
  icons: {
    icon: "/brand/favicon.png",
    apple: "/brand/apple-icon.png",
  },
  openGraph: {
    title: "activasalida · Tu proximo plan empieza aca",
    description:
      "Planes presenciales con gente que ya sabes quien es. Sin grupo de WhatsApp.",
    url: "https://activasalida.com",
    siteName: "activasalida",
    images: ["/brand/og-image.png"],
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4552E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={inter.variable}>
      <body className="min-h-screen bg-crema text-tinta antialiased">
        {children}
      </body>
    </html>
  );
}
