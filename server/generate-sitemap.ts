import { tools } from "../client/src/lib/tools-data";

export function generateSitemap(): string {
    const baseUrl = "https://student99.me";
    const currentDate = new Date().toISOString().split('T')[0];

    // Define all public URLs with their priorities and change frequencies
    const urls = [
        {
            loc: baseUrl + "/",
            lastmod: currentDate,
            changefreq: "weekly",
            priority: "1.0"
        },
        {
            loc: baseUrl + "/tools",
            lastmod: currentDate,
            changefreq: "weekly",
            priority: "0.9"
        },
        // Add all 99 tool routes
        ...tools.map(tool => ({
            loc: baseUrl + tool.path,
            lastmod: currentDate,
            changefreq: "monthly",
            priority: "0.8"
        }))
    ];

    // Generate XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const url of urls) {
        xml += '  <url>\n';
        xml += `    <loc>${url.loc}</loc>\n`;
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        xml += `    <priority>${url.priority}</priority>\n`;
        xml += '  </url>\n';
    }

    xml += '</urlset>';

    return xml;
}
