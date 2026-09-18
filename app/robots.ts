import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
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
    sitemap: 'https://veri-sett.com/sitemap.xml',
  };
}
