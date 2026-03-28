import mongoose from 'mongoose';

const ScanResultSchema = new mongoose.Schema({
  url: { type: String, required: true },
  scannedAt: { type: Date, default: Date.now },
  metrics: {
    totalBytes: Number,
    totalRequests: Number,
    thirdPartyScripts: Number,
    imageSize: Number,
    fontSize: Number,
    responseTime: Number,
    isCDN: Boolean,
    isGreenHosting: Boolean
  },
  co2: {
    grams: Number,
    gramsRenewable: Number,
    source: String
  },
  score: Number,
  grade: String,
  suggestions: [String]
});

const ScanResult = mongoose.model('ScanResult', ScanResultSchema);

export default ScanResult;