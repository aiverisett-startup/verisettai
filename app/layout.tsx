import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const siteUrl = "https://www.veri-sett.com";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.veri-sett.com'),
  title: {
    default: "Verisett AI — Autonomous Multi-Agent Escrow Protocol",
    template: "%s | Verisett AI",
  },
  description:
    "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP. Deterministic non-custodial vault escrow for autonomous AI agents.",
  applicationName: "Verisett AI",
  icons: {
    icon: [
      { url: '/icon.png?v=4', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.ico?v=4', sizes: 'any' }
    ],
    apple: '/apple-icon.png?v=4',
  },
  authors: [
    { name: "Manoj S.M.", url: "https://github.com/aiverisett-startup" },
    { name: "Verisett AI", url: siteUrl }
  ],
  creator: "Manoj S.M.",
  publisher: "Verisett AI Project / Manoj S.M.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    "Verisett AI",
    "Manoj S.M.",
    "Autonomous Agent Escrow",
    "Settlement Protocol",
    "Multi-Agent Economies",
    "Model Context Protocol",
    "MCP Settlement",
    "FastMCP",
    "Software Escrow",
    "Milestone Protection",
    "Automated Settlement",
    "Developer Sandbox",
    "Institutional Vault Custody",
    "Autonomous AI Clearinghouse",
    "Deterministic Settlement",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Verisett AI — Settlement Engine for Autonomous Agents",
    description:
      "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP. Deterministic non-custodial vault escrow for autonomous AI agents.",
    url: siteUrl,
    siteName: "Verisett AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.png?v=4",
        width: 512,
        height: 512,
        alt: "Verisett AI Official Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verisett AI — Settlement Engine for Autonomous Agents",
    description:
      "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP. Founded & Architected by Manoj S.M.",
    site: "@ai_verisett",
    creator: "@ai_verisett",
    images: ["/icon.png?v=4"],
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
    "@graph": [
      {
        "@type": ["FinancialApplication", "SoftwareApplication"],
        "@id": "https://veri-sett.com/#protocol",
        "name": "Verisett AI",
        "alternateName": "Verisett Protocol",
        "url": "https://veri-sett.com",
        "logo": "https://veri-sett.com/icon.png",
        "image": "https://veri-sett.com/icon.png",
        "applicationCategory": "FinancialApplication",
        "operatingSystem": "Model Context Protocol (MCP) / FastMCP / REST",
        "description": "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP. Deterministic programmable vault escrow for autonomous AI agents.",
        "softwareVersion": "2.4.0",
        "offers": {
          "@type": "Offer",
          "price": "1.5",
          "priceCurrency": "USD",
          "description": "1.5% flat take rate per settled escrow milestone"
        },
        "creator": {
          "@id": "https://veri-sett.com/#founder"
        },
        "author": {
          "@id": "https://veri-sett.com/#founder"
        },
        "termsOfService": "https://veri-sett.com/terms",
        "publishingPrinciples": "https://veri-sett.com/security",
        "hasPart": [
          {
            "@type": "WebPage",
            "name": "Security Architecture & Deterministic Escrow",
            "url": "https://veri-sett.com/security",
            "description": "Non-custodial deterministic escrow vault architecture with <50ms mathematical verification, SHA-256 assertions, and timeout refund guarantees."
          },
          {
            "@type": "WebPage",
            "name": "Terms of Service",
            "url": "https://veri-sett.com/terms",
            "description": "Institutional terms of service governing Verisett AI multi-agent settlement protocol."
          },
          {
            "@type": "WebPage",
            "name": "About Verisett AI & Leadership",
            "url": "https://veri-sett.com/about",
            "description": "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP. Founded and architected by Manoj S.M."
          },
          {
            "@type": "WebPage",
            "name": "Privacy Policy",
            "url": "https://veri-sett.com/privacy",
            "description": "Enterprise data protection and telemetry privacy policies for autonomous agent operators."
          },
          {
            "@type": "WebPage",
            "name": "Protocol Documentation",
            "url": "https://veri-sett.com/docs",
            "description": "FastMCP Python SDK, Model Context Protocol configurations, and REST gateway specifications."
          }
        ],
        "sameAs": [
          "https://github.com/aiverisett-startup/verisettai",
          "https://github.com/aiverisett-startup",
          "https://x.com/ai_verisett",
          "https://www.youtube.com/@VerisettAI",
          "https://www.instagram.com/ai.verisett/"
        ]
      },
      {
        "@type": "Person",
        "@id": "https://veri-sett.com/#founder",
        "name": "Manoj S.M.",
        "jobTitle": "Founder & Lead Architect",
        "worksFor": {
          "@type": "Organization",
          "name": "Verisett AI Project",
          "url": "https://veri-sett.com"
        },
        "sameAs": [
          "https://github.com/aiverisett-startup",
          "https://x.com/ai_verisett"
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://veri-sett.com/#organization",
        "name": "Verisett AI",
        "url": "https://veri-sett.com",
        "logo": "https://veri-sett.com/icon.png",
        "founder": {
          "@id": "https://veri-sett.com/#founder"
        },
        "sameAs": [
          "https://github.com/aiverisett-startup/verisettai",
          "https://x.com/ai_verisett",
          "https://www.youtube.com/@VerisettAI",
          "https://www.instagram.com/ai.verisett/"
        ]
      }
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
          "text": "Verisett AI is the Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP for deterministic non-custodial milestone escrow between autonomous agents."
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
