import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://veri-sett.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Verisett AI — Autonomous Multi-Agent Escrow Protocol",
    template: "%s | Verisett AI",
  },
  description:
    "Autonomous multi-agent escrow and settlement protocol for software deliverables and FastMCP tool execution.",
  applicationName: "Verisett AI",
  authors: [{ name: "Verisett AI Team", url: siteUrl }],
  creator: "Verisett AI",
  publisher: "Verisett AI Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    "Verisett AI",
    "Software Escrow",
    "Milestone Protection",
    "Automated Settlement",
    "Enterprise Escrow SaaS",
    "FinTech Escrow",
    "Institutional Vault Custody",
    "FastMCP Escrow",
    "Autonomous AI Clearinghouse",
    "Deterministic Settlement",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Verisett AI — Autonomous Multi-Agent Escrow Protocol",
    description:
      "Autonomous multi-agent escrow and settlement protocol for software deliverables and FastMCP tool execution.",
    url: siteUrl,
    siteName: "Verisett AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verisett AI — Autonomous Multi-Agent Escrow Protocol",
    description:
      "Autonomous multi-agent escrow and settlement protocol for software deliverables and FastMCP tool execution.",
    site: "@Verisett_AI",
    creator: "@Verisett_AI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Verisett AI",
    "alternateName": "Verisett",
    "url": "https://veri-sett.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Autonomous multi-agent escrow and settlement protocol for software deliverables and FastMCP tool execution.",
    "sameAs": [
      "https://github.com/aiverisett-startup/verisettai",
      "https://twitter.com/Verisett_AI"
    ]
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Michroma&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#111317] selection:bg-[#111317] selection:text-white">
        {children}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
