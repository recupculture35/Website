const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  console.log('Browser launched.');
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, '..', 'kakemono-1-art.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log('Loading:', fileUrl);

  // Standard resolution (1020x2400)
  await page.setViewport({ width: 1020, height: 2400, deviceScaleFactor: 1 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('Page loaded (standard).');
  await new Promise(r => setTimeout(r, 2000));

  const outDir = path.resolve(__dirname, '..', 'communication', 'kakemono');
  const stdPath = path.join(outDir, 'kakemono-1-modele-illustre.png');
  await page.screenshot({ path: stdPath, fullPage: false, clip: { x: 0, y: 0, width: 1020, height: 2400 } });
  console.log('Standard saved:', stdPath);

  // HD resolution (2040x4800) for 300 DPI print
  await page.setViewport({ width: 1020, height: 2400, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('Page loaded (HD).');
  await new Promise(r => setTimeout(r, 2000));

  const hdPath = path.join(outDir, 'kakemono-1-modele-illustre-HD.png');
  await page.screenshot({ path: hdPath, fullPage: false, clip: { x: 0, y: 0, width: 1020, height: 2400 } });
  console.log('HD saved:', hdPath);

  await browser.close();
  console.log('Done!');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
