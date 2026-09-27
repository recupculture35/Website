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

  const kakemonoDir = path.resolve(__dirname, '..', 'communication', 'kakemono');

  // ═══════════════ 1. KAKEMONO 1 : MODÈLE ILLUSTRÉ ═══════════════
  const html1 = path.join(kakemonoDir, 'kakemono-1-art.html');
  const fileUrl1 = 'file:///' + html1.replace(/\\/g, '/');
  console.log('Loading Kakemono 1:', fileUrl1);

  // Standard resolution (1020x2400)
  await page.setViewport({ width: 1020, height: 2400, deviceScaleFactor: 1 });
  await page.goto(fileUrl1, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  const stdPath1 = path.join(kakemonoDir, 'kakemono-1-modele-illustre.png');
  await page.screenshot({ path: stdPath1, fullPage: false, clip: { x: 0, y: 0, width: 1020, height: 2400 } });
  console.log('Kakemono 1 Standard saved:', stdPath1);

  // HD resolution (2040x4800) for 300 DPI print
  await page.setViewport({ width: 1020, height: 2400, deviceScaleFactor: 2 });
  await page.goto(fileUrl1, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  const hdPath1 = path.join(kakemonoDir, 'kakemono-1-modele-illustre-HD.png');
  await page.screenshot({ path: hdPath1, fullPage: false, clip: { x: 0, y: 0, width: 1020, height: 2400 } });
  console.log('Kakemono 1 HD saved:', hdPath1);

  // ═══════════════ 2. KAKEMONO 2 : MODÈLE INFOGRAPHIQUE ═══════════════
  const html2 = path.join(kakemonoDir, 'kakemono-2-art.html');
  const fileUrl2 = 'file:///' + html2.replace(/\\/g, '/');
  console.log('Loading Kakemono 2:', fileUrl2);

  // Standard resolution (1200x2400)
  await page.setViewport({ width: 1200, height: 2400, deviceScaleFactor: 1 });
  await page.goto(fileUrl2, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  const stdPath2 = path.join(kakemonoDir, 'kakemono-2-modele-infographique.png');
  await page.screenshot({ path: stdPath2, fullPage: false, clip: { x: 0, y: 0, width: 1200, height: 2400 } });
  console.log('Kakemono 2 Standard saved:', stdPath2);

  // HD resolution (2400x4800) for 300 DPI print
  await page.setViewport({ width: 1200, height: 2400, deviceScaleFactor: 2 });
  await page.goto(fileUrl2, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  const hdPath2 = path.join(kakemonoDir, 'kakemono-2-modele-infographique-HD.png');
  await page.screenshot({ path: hdPath2, fullPage: false, clip: { x: 0, y: 0, width: 1200, height: 2400 } });
  console.log('Kakemono 2 HD saved:', hdPath2);

  await browser.close();
  console.log('All kakemonos rendered successfully!');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
