const NodeCache = require("node-cache");

const otpCache = new NodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

const registerKey = (email) => `register:${String(email).trim().toLowerCase()}`;
const resetKey = (email) => `reset:${String(email).trim().toLowerCase()}`;

const setRegisterPayload = (email, payload) => otpCache.set(registerKey(email), payload);
const getRegisterPayload = (email) => otpCache.get(registerKey(email));
const deleteRegisterPayload = (email) => otpCache.del(registerKey(email));

const setResetPayload = (email, payload) => otpCache.set(resetKey(email), payload);
const getResetPayload = (email) => otpCache.get(resetKey(email));
const deleteResetPayload = (email) => otpCache.del(resetKey(email));

module.exports = {
  setRegisterPayload,
  getRegisterPayload,
  deleteRegisterPayload,
  setResetPayload,
  getResetPayload,
  deleteResetPayload,
};