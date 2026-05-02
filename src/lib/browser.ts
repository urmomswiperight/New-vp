import axios from 'axios';

/**
 * Executes a scrape via ScrapingBee's REST API.
 * This is a highly stable, stateless replacement for WebSocket-based Playwright connections.
 */
export async function scrapeWithScrapingBee(
    url: string, 
    params: { 
        render_js?: boolean; 
        premium_proxy?: boolean; 
        country_code?: string;
        custom_js?: string; 
    } = {}
) {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) throw new Error('SCRAPINGBEE_API_KEY is not defined.');

    try {
        console.log(`🚀 ScrapingBee: ${url}`);
        const response = await axios.get('https://app.scrapingbee.com/api/v1', {
            params: {
                api_key: apiKey,
                url: url,
                render_js: params.render_js ?? true,
                premium_proxy: params.premium_proxy ?? true,
                country_code: params.country_code ?? 'us',
                ...params
            }
        });

        return response.data;
    } catch (error: any) {
        console.error('❌ ScrapingBee failed:', error.response?.data || error.message);
        throw error;
    }
}
