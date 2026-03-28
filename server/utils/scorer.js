export const computeScore = (co2Grams) => {
  let grade = 'F';

  if (co2Grams < 0.1) {
    grade = 'A';
  } else if (co2Grams >= 0.1 && co2Grams < 0.3) {
    grade = 'B';
  } else if (co2Grams >= 0.3 && co2Grams < 0.6) {
    grade = 'C';
  } else if (co2Grams >= 0.6 && co2Grams < 1.0) {
    grade = 'D';
  } else if (co2Grams >= 1.0 && co2Grams <= 2.0) {
    grade = 'E';
  }

  let score = Math.max(0, Math.min(100, 100 - (co2Grams / 2.0) * 100));
  score = parseFloat(score.toFixed(1));

  return { grade, score };
};

export const generateSuggestions = (metrics) => {
  const suggestions = [];

  if (metrics.imageSize > 500000) {
    suggestions.push('Compress and convert images to WebP format to reduce image payload');
  }

  if (metrics.thirdPartyScripts > 5) {
    suggestions.push(
      `Remove or defer third-party scripts — currently loading ${metrics.thirdPartyScripts} external scripts`
    );
  }

  if (metrics.fontSize > 100000) {
    suggestions.push('Reduce font variants or switch to system fonts to cut font payload');
  }

  if (!metrics.isGreenHosting) {
    suggestions.push('Switch to a green hosting provider such as Cloudflare or GreenGeeks');
  }

  if (metrics.totalRequests > 80) {
    suggestions.push(
      `Reduce HTTP requests — currently making ${metrics.totalRequests} requests per page load`
    );
  }

  if (metrics.responseTime > 2000) {
    suggestions.push(
      `Improve server response time — currently ${metrics.responseTime}ms`
    );
  }

  if (suggestions.length === 0) {
    suggestions.push('Great job! This website has a low environmental footprint.');
  }

  return suggestions;
};