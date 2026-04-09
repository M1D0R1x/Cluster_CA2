#!/usr/bin/env node
/**
 * generate_pdf.js
 * ────────────────────────────────────────────
 * Converts report.html → MOOC_Completion_Prediction.pdf
 *
 * Usage:
 *   node generate_pdf.js                     # defaults
 *   node generate_pdf.js --output my.pdf     # custom output name
 *
 * Requirements:
 *   npm install puppeteer-core   (already in package.json)
 *   Google Chrome installed at the default macOS path
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// ── Configuration ──────────────────────────────────────────────
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HTML_FILE = path.resolve(__dirname, 'report.html');

// Parse CLI args
const args = process.argv.slice(2);
let outputName = 'MOOC_Completion_Prediction_Report.pdf';
const outIdx = args.indexOf('--output');
if (outIdx !== -1 && args[outIdx + 1]) {
  outputName = args[outIdx + 1];
}
const OUTPUT_PDF = path.resolve(__dirname, outputName);

// ── Main ───────────────────────────────────────────────────────
(async () => {
  console.log('🚀  Launching headless Chrome…');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Load the HTML file
  const fileUrl = `file://${HTML_FILE}`;
  console.log(`📄  Loading ${path.basename(HTML_FILE)}…`);
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Give fonts and images a moment to fully render
  await new Promise((r) => setTimeout(r, 1500));

  // Generate the PDF
  console.log('🖨️   Generating PDF…');
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    margin: {
      top: '20mm',
      right: '25mm',
      bottom: '20mm',
      left: '25mm',
    },
    printBackground: true,
    preferCSSPageSize: false,   // use our explicit margins above
    displayHeaderFooter: false,
  });

  await browser.close();

  const stats = fs.statSync(OUTPUT_PDF);
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log(`✅  PDF saved → ${OUTPUT_PDF}  (${sizeKB} KB)`);
})().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
