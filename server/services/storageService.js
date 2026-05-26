import { randomUUID } from 'crypto';
import ScanResult from '../models/ScanResult.js';

const memoryStore = [];

export const getStorageMode = () => {
  const rawMode = process.env.STORAGE_MODE || 'memory';
  return rawMode.toLowerCase() === 'mongo' ? 'mongo' : 'memory';
};

const withDefaults = (result) => {
  return {
    ...result,
    _id: result._id || randomUUID(),
    scannedAt: result.scannedAt || new Date()
  };
};

const createInMemory = async (result) => {
  const saved = withDefaults(result);
  memoryStore.unshift(saved);
  return saved;
};

const getRecentInMemory = async (limit) => {
  return memoryStore.slice(0, limit);
};

const getByIdInMemory = async (id) => {
  return memoryStore.find((item) => item._id === id) || null;
};

export const createScanResult = async (result) => {
  try {
    if (getStorageMode() === 'mongo') {
      return await ScanResult.create(result);
    }
    return await createInMemory(result);
  } catch (error) {
    throw error;
  }
};

export const getRecentScanResults = async (limit = 20) => {
  try {
    if (getStorageMode() === 'mongo') {
      return await ScanResult.find().sort({ scannedAt: -1 }).limit(limit);
    }
    return await getRecentInMemory(limit);
  } catch (error) {
    throw error;
  }
};

export const getScanResultById = async (id) => {
  try {
    if (getStorageMode() === 'mongo') {
      return await ScanResult.findById(id);
    }
    return await getByIdInMemory(id);
  } catch (error) {
    throw error;
  }
};