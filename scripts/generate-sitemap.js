import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Tool data - all 99 tools
const tools = [
    // UNIVERSAL CONVERTER
    { path: "/tools/universal-file-converter" },
    // CALCULATORS (14)
    { path: "/tools/scientific-calculator" },
    { path: "/tools/percentage-calculator" },
    { path: "/tools/emi-calculator" },
    { path: "/tools/gpa-calculator" },
    { path: "/tools/cgpa-calculator" },
    { path: "/tools/age-calculator" },
    { path: "/tools/unit-converter" },
    { path: "/tools/time-duration" },
    { path: "/tools/bmi-calculator" },
    { path: "/tools/grade-needed" },
    { path: "/tools/quadratic-solver" },
    { path: "/tools/statistics-calculator" },
    { path: "/tools/binary-converter" },
    { path: "/tools/fraction-calculator" },
    // IMAGE TOOLS (15)
    { path: "/tools/image-resizer" },
    { path: "/tools/image-cropper" },
    { path: "/tools/image-compressor" },
    { path: "/tools/advanced-compressor" },
    { path: "/tools/image-quality" },
    { path: "/tools/jpg-to-png" },
    { path: "/tools/png-to-jpg" },
    { path: "/tools/image-grayscale" },
    { path: "/tools/image-preview" },
    { path: "/tools/image-dpi-changer" },
    { path: "/tools/image-metadata-remover" },
    { path: "/tools/image-border-adder" },
    { path: "/tools/image-text-overlay" },
    { path: "/tools/image-background-blur" },
    { path: "/tools/image-aspect-ratio" },
    // PDF TOOLS (10)
    { path: "/tools/pdf-merge" },
    { path: "/tools/pdf-split" },
    { path: "/tools/pdf-reorder" },
    { path: "/tools/images-to-pdf" },
    { path: "/tools/pdf-extract" },
    { path: "/tools/pdf-rotate" },
    { path: "/tools/pdf-metadata" },
    { path: "/tools/pdf-compressor" },
    { path: "/tools/pdf-page-extractor" },
    { path: "/tools/pdf-page-reorder" },
    // MEDIA TOOLS (15)
    { path: "/tools/audio-compressor" },
    { path: "/tools/audio-trim" },
    { path: "/tools/audio-speed" },
    { path: "/tools/audio-converter" },
    { path: "/tools/video-compressor" },
    { path: "/tools/video-trim" },
    { path: "/tools/video-to-audio" },
    { path: "/tools/video-frame-extractor" },
    { path: "/tools/video-resolution-changer" },
    { path: "/tools/video-metadata-viewer" },
    { path: "/tools/video-thumbnail-generator" },
    { path: "/tools/audio-silence-remover" },
    { path: "/tools/audio-fade" },
    { path: "/tools/audio-metadata-editor" },
    { path: "/tools/audio-channel-converter" },
    // STUDENT TOOLS (10)
    { path: "/tools/notes-manager" },
    { path: "/tools/todo-list" },
    { path: "/tools/timetable-generator" },
    { path: "/tools/flashcard-maker" },
    { path: "/tools/attendance-calculator" },
    { path: "/tools/marks-predictor" },
    { path: "/tools/study-hours-tracker" },
    { path: "/tools/bibliography-generator" },
    { path: "/tools/reading-time-calculator" },
    { path: "/tools/grade-tracker" },
    // TEXT & WRITING TOOLS (12)
    { path: "/tools/word-counter" },
    { path: "/tools/text-case-converter" },
    { path: "/tools/lorem-ipsum-generator" },
    { path: "/tools/find-replace" },
    { path: "/tools/remove-duplicates" },
    { path: "/tools/text-diff" },
    { path: "/tools/markdown-preview" },
    { path: "/tools/json-formatter" },
    { path: "/tools/text-to-slug" },
    { path: "/tools/text-reverser" },
    { path: "/tools/text-sorter" },
    { path: "/tools/text-encoder" },
    // FINANCE TOOLS (10)
    { path: "/tools/sip-calculator" },
    { path: "/tools/tip-calculator" },
    { path: "/tools/loan-calculator" },
    { path: "/tools/simple-interest" },
    { path: "/tools/compound-interest" },
    { path: "/tools/savings-goal" },
    { path: "/tools/discount-calculator" },
    { path: "/tools/currency-converter" },
    { path: "/tools/tax-calculator" },
    { path: "/tools/budget-planner" },
    // UTILITY TOOLS (13)
    { path: "/tools/password-generator" },
    { path: "/tools/qr-generator" },
    { path: "/tools/random-number" },
    { path: "/tools/uuid-generator" },
    { path: "/tools/color-picker" },
    { path: "/tools/hash-generator" },
    { path: "/tools/timezone-converter" },
    { path: "/tools/roman-numeral" },
    { path: "/tools/morse-code" },
    { path: "/tools/stopwatch" },
    { path: "/tools/countdown-timer" },
    { path: "/tools/habit-tracker" },
    { path: "/tools/bookmark-manager" },
];

function generateSitemap() {
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

// Generate and save sitemap to public directory
const sitemap = generateSitemap();
const outputPath = join(__dirname, '../client/public/sitemap.xml');

try {
    writeFileSync(outputPath, sitemap, 'utf8');
    console.log(`✅ Sitemap generated successfully at: ${outputPath}`);
    console.log(`📊 Total URLs: ${tools.length + 2}`);
} catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
}
