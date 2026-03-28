import { crawlURL } from '../services/crawlerService.js';
import { fetchCarbonData } from '../services/websiteCarbonAPI.js';
import { estimateCO2 } from '../services/carbonService.js';
import { computeScore, generateSuggestions } from '../utils/scorer.js';
import {
  createScanResult,
  getRecentScanResults,
  getScanResultById
} from '../services/storageService.js';

export const scanURL = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const metrics = await crawlURL(url);

    let co2Data;
    try {
      co2Data = await fetchCarbonData(url);
      metrics.isGreenHosting = co2Data.isGreenHosting;
    } catch (error) {
      co2Data = estimateCO2(metrics);
    }

    const { grade, score } = computeScore(co2Data.grams);
    const suggestions = generateSuggestions(metrics);

    const result = {
      url,
      metrics,
      co2: {
        grams: co2Data.grams,
        gramsRenewable: co2Data.gramsRenewable,
        source: co2Data.source
      },
      score,
      grade,
      suggestions
    };

    const saved = await createScanResult(result);
    return res.status(201).json(saved);
  } catch (error) {
    return next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await getRecentScanResults(20);
    return res.json(history);
  } catch (error) {
    return next(error);
  }
};

export const getScanById = async (req, res, next) => {
  try {
    const scan = await getScanResultById(req.params.id);

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    return res.json(scan);
  } catch (error) {
    return next(error);
  }
};