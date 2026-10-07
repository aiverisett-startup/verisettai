import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', '/icon.png', '/favicon.ico', '/apple-icon.png', '/icon*'],
      },
      {
        userAgent: [
          'Googlebot',
          'Google-Extended', // Gemini live retrieval
          'GPTBot',          // OpenAI training
          'OAI-SearchBot',   // ChatGPT Search live answers
          'ClaudeBot',       // Anthropic Claude
          'PerplexityBot',   // Perplexity AI
        ],
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://www.veri-sett.com/sitemap.xml',
  };
}
