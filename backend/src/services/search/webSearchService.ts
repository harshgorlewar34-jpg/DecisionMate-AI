import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SearchResultItem {
  query: string;
  title: string;
  snippet: string;
  url?: string;
  source: string;
}

export class WebSearchService {
  /**
   * Determines if web research is actually required.
   */
  isResearchRequired(text: string): boolean {
    const lower = text.toLowerCase();
    const currentKeywords = [
      'in 2026', 'in 2025', 'current price', 'latest', 'today', 'recent',
      'placement data', 'cheaper today', 'currently best', 'market rate',
      'reviews', 'benchmark', 'launch date', 'under 60,000', 'under 50000'
    ];

    // Check if any temporal or live product query keywords are present
    return currentKeywords.some(kw => lower.includes(kw));
  }

  /**
   * Executes web search safely.
   */
  async search(query: string): Promise<{ success: boolean; results: SearchResultItem[]; error?: string }> {
    try {
      // Use DuckDuckGo HTML search for real-time snippets
      const encodedQuery = encodeURIComponent(query);
      const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 4000
      });

      const $ = cheerio.load(response.data);
      const items: SearchResultItem[] = [];

      $('.result').each((i, el) => {
        if (items.length >= 3) return;
        const title = $(el).find('.result__title a').text().trim();
        const snippet = $(el).find('.result__snippet').text().trim();
        const link = $(el).find('.result__url').text().trim();

        if (title && snippet) {
          items.push({
            query,
            title,
            snippet,
            url: link.startsWith('http') ? link : `https://${link}`,
            source: 'DuckDuckGo Live Search'
          });
        }
      });

      if (items.length > 0) {
        return { success: true, results: items };
      }

      return {
        success: false,
        results: [],
        error: 'No search results returned for query.'
      };
    } catch (err: any) {
      // Per Rule 8 & 9: if live search fails, fail transparently without hallucinating fake sources
      return {
        success: false,
        results: [],
        error: `I couldn't verify the latest information online (${err?.message || 'network limit'}). I can still provide a general analysis, but the current facts should be verified before making the final decision.`
      };
    }
  }
}

export const webSearchService = new WebSearchService();
