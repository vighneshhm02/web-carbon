import puppeteer from 'puppeteer';

export const crawlURL = async (url) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const client = await page.createCDPSession();
    await client.send('Network.enable');

    const responses = [];
    client.on('Network.responseReceived', (event) => {
      responses.push({
        requestId: event.requestId,
        response: event.response
      });
    });

    const networkData = [];
    client.on('Network.loadingFinished', (event) => {
      networkData.push(event);
    });

    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const responseTime = Date.now() - startTime;

    const targetHostname = new URL(url).hostname;
    const requestSizeMap = new Map();

    for (const item of networkData) {
      requestSizeMap.set(item.requestId, item.encodedDataLength || 0);
    }

    let totalBytes = 0;
    let thirdPartyScripts = 0;
    let imageSize = 0;
    let fontSize = 0;
    let isCDN = false;

    for (const item of responses) {
      const currentResponse = item.response;
      const matchedBytes = requestSizeMap.get(item.requestId);
      const fallbackBytes = currentResponse.encodedDataLength || 0;
      const bytes = typeof matchedBytes === 'number' ? matchedBytes : fallbackBytes;

      totalBytes += bytes;

      const responseURL = currentResponse.url || '';
      const mimeType = (currentResponse.mimeType || '').toLowerCase();

      try {
        const responseHostname = new URL(responseURL).hostname;
        const isJS = mimeType.includes('javascript') || responseURL.split('?')[0].endsWith('.js');
        if (isJS && responseHostname !== targetHostname) {
          thirdPartyScripts += 1;
        }
      } catch (error) {
        const isJS = mimeType.includes('javascript') || responseURL.split('?')[0].endsWith('.js');
        if (isJS) {
          thirdPartyScripts += 1;
        }
      }

      if (mimeType.includes('image')) {
        imageSize += bytes;
      }

      if (mimeType.includes('font')) {
        fontSize += bytes;
      }

      const headers = currentResponse.headers || {};
      const normalizedHeaderKeys = Object.keys(headers).map((key) => key.toLowerCase());
      if (
        normalizedHeaderKeys.includes('cf-ray') ||
        normalizedHeaderKeys.includes('x-cache') ||
        normalizedHeaderKeys.includes('x-amz-cf-id') ||
        normalizedHeaderKeys.includes('x-served-by')
      ) {
        isCDN = true;
      }
    }

    await browser.close();

    return {
      totalBytes,
      totalRequests: responses.length,
      thirdPartyScripts,
      imageSize,
      fontSize,
      responseTime,
      isCDN,
      isGreenHosting: false
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
};