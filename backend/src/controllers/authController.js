import { evolutionService } from '../services/evolutionService.js';

export const getQrCode = async (req, res, next) => {
  try {
    const instance = req.params.instance || req.query.instance;
    const qrData = await evolutionService.getQrCode(instance);
    const connState = await evolutionService.getConnectionState(instance);
    res.json({
      ...qrData,
      connectionState: connState.state
    });
  } catch (err) {
    next(err);
  }
};

export const createInstance = async (req, res, next) => {
  try {
    const { instanceName } = req.body;
    const result = await evolutionService.createInstance(instanceName);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getConnectionState = async (req, res, next) => {
  try {
    const instance = req.params.instance || req.query.instance;
    const state = await evolutionService.getConnectionState(instance);
    res.json(state);
  } catch (err) {
    next(err);
  }
};

export const disconnect = async (req, res, next) => {
  try {
    const instance = req.params.instance || req.query.instance;
    const result = await evolutionService.logoutInstance(instance);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const simulateConnection = async (req, res, next) => {
  try {
    const { connected } = req.body;
    const result = evolutionService.setSimulatedState(connected !== false);
    res.json({
      success: true,
      message: connected !== false ? 'Simulated WhatsApp link enabled' : 'Simulated WhatsApp disconnected',
      ...result
    });
  } catch (err) {
    next(err);
  }
};
