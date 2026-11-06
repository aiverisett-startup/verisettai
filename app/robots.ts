import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', '/images/', '/images/*', '/founder.jpg', '/icon.png', '/favicon.ico', '/apple-icon.png', '/icon*'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/images/', '/images/*'],
      },
      {
        userAgent: [
          'Googlebot',
          'Google-Extended', // Gemini live retrieval
          'OAI-SearchBot',   // ChatGPT Search live answers
          'ClaudeBot',       // Anthropic Claude
          'PerplexityBot',   // Perplexity AI
        ],
        allow: ['/', '/images/', '/images/*'],
      },
      {
        userAgent: '*',
        allow: ['/', '/images/', '/images/*'],
      },
    ],
    sitemap: 'https://www.veri-sett.com/sitemap.xml',
  };
}
