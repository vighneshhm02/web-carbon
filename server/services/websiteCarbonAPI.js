import axios from 'axios';

export const fetchCarbonData = async (url) => {
  try {
    const response = await axios.get(
      `https://api.websitecarbon.com/site?url=${encodeURIComponent(url)}`,
      {
        timeout: 10000
      }
    );

    const data = response.data;

    const grams = data.statistics.co2.grid.grams;
    const gramsRenewable = data.statistics.co2.renewable.grams;
    const isGreenHosting = data.green;

    return {
      grams,
      gramsRenewable,
      isGreenHosting,
      source: 'api'
    };
  } catch (error) {
    throw error;
  }
};