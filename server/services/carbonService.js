export const estimateCO2 = (metrics) => {
  const energyKwh = (metrics.totalBytes / 1e9) * 0.81;
  const co2Grams = energyKwh * 442;
  const adjusted = metrics.isGreenHosting ? co2Grams * 0.18 : co2Grams;

  return {
    grams: parseFloat(adjusted.toFixed(4)),
    gramsRenewable: metrics.isGreenHosting ? parseFloat((co2Grams * 0.18).toFixed(4)) : 0,
    isGreenHosting: metrics.isGreenHosting || false,
    source: 'formula'
  };
};