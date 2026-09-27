const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  console.log('Browser launched.');
  const page = await browser.newPage();

  const kakemonoDir = path.resolve(__dirname, '..', 'communication', 'kakemono');

  const htmlFile = path.join(kakemonoDir, 'kakemono-1-art.html');
  const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');
  console.log('Loading Kakemono Officiel:', fileUrl);

  // 1. Standard resolution PNG (1020x2400)
  await page.setViewport({ width: 1020, height: 2400, deviceScaleFactor: 1 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  const stdPath = path.join(kakemonoDir, 'kakemono-1-modele-illustre.png');
  await page.screenshot({ path: stdPath, fullPage: false, clip: { x: 0, y: 0, width: 1020, height: 2400 } });
  console.log('Standard PNG saved:', stdPath);

  // 2. HD resolution PNG (2040x4800) for 300 DPI print
  await page.setViewport({ width: 1020, height: 2400, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  const hdPath = path.join(kakemonoDir, 'kakemono-1-modele-illustre-HD.png');
  await page.screenshot({ path: hdPath, fullPage: false, clip: { x: 0, y: 0, width: 1020, height: 2400 } });
  console.log('HD PNG saved:', hdPath);

  // 3. HD Print-Ready PDF (850x2000mm)
  const pdfPage = await browser.newPage();
  const tempHtml = path.join(kakemonoDir, 'temp-hd-print.html');
  fs.writeFileSync(tempHtml, `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kakemono 1 – RECUP CULTURE (850×2000mm)</title>
  <style>
    @page {
      size: 850mm 2000mm;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #f7efe2;
    }
    img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <img src="kakemono-1-modele-illustre-HD.png" alt="Kakemono RECUP CULTURE 85x200cm HD">
</body>
</html>`);

  await pdfPage.goto('file:///' + tempHtml.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await pdfPage.evaluate(async () => {
    const img = document.querySelector('img');
    if (!img.complete) {
      await new Promise(res => { img.onload = res; img.onerror = res; });
    }
  });

  const pdfPath = path.join(kakemonoDir, 'kakemono-1-modele-illustre-HD.pdf');
  await pdfPage.pdf({
    path: pdfPath,
    preferCSSPageSize: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  console.log('HD PDF saved (850x2000mm):', pdfPath);
  fs.unlinkSync(tempHtml);
  await pdfPage.close();

  await browser.close();
  console.log('All Kakemono assets (Standard PNG, HD PNG, HD PDF) rendered successfully!');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
