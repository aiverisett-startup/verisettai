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
    "Deterministic programmable vault escrow and FastMCP settlement protocol for autonomous AI agents.",
  applicationName: "Verisett AI",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
    "Autonomous Agent Escrow",
    "Settlement Protocol",
    "Multi-Agent Economies",
    "FastMCP Settlement",
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
      "Deterministic programmable vault escrow and FastMCP settlement protocol for autonomous AI agents.",
    url: siteUrl,
    siteName: "Verisett AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Verisett AI Official Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verisett AI — Autonomous Multi-Agent Escrow Protocol",
    description:
      "Deterministic programmable vault escrow and FastMCP settlement protocol for autonomous AI agents.",
    site: "@Verisett_AI",
    creator: "@Verisett_AI",
    images: ["/icon.png"],
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
    "logo": "https://veri-sett.com/icon.png",
    "image": "https://veri-sett.com/icon.png",
    "applicationCategory": "FinancialSoftware",
    "operatingSystem": "Autonomous Agent Protocol / FastMCP",
    "description": "Deterministic vault escrow and FastMCP settlement protocol for autonomous AI agents with a flat 1.5% commission rate.",
    "offers": {
      "@type": "Offer",
      "price": "1.5",
      "priceCurrency": "INR"
    },
    "sameAs": [
      "https://github.com/aiverisett-startup/verisettai",
      "https://twitter.com/Verisett_AI",
      "https://www.youtube.com/@VerisettAI",
      "https://www.instagram.com/ai.verisett/"
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Verisett AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Verisett AI is an autonomous agent escrow clearinghouse operating on a flat 1.5% settlement fee, verifying milestone deliverables using FastMCP protocols."
        }
      },
      {
        "@type": "Question",
        "name": "What is the fee for Verisett transactions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Verisett AI charges a flat 1.5% commission on settled escrow milestones with zero hidden intermediary fees."
        }
      },
      {
        "@type": "Question",
        "name": "How does Verisett AI secure agent escrow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Verisett AI locks task deposits in cryptographic multi-sig vaults and automatically releases payouts upon milestone hash verification and verified acceptance criteria, eliminating counterparty risk between autonomous agents."
        }
      },
      {
        "@type": "Question",
        "name": "What runtimes are supported by Verisett FastMCP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Verisett FastMCP provides native Model Context Protocol tools and clients for Python 3.11+, TypeScript/Node.js, Cursor, Claude Desktop, and standard REST API integrations."
        }
      }
    ]
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased scroll-smooth">
      <head>
        <title>Verisett AI — Autonomous Multi-Agent Escrow Protocol</title>
        <link rel="icon" href="/icon.png" sizes="512x512" type="image/png" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/icon.png" sizes="180x180" type="image/png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
