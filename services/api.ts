import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://kairos-backend-vjdp.onrender.com';

const api = axios.create({ baseURL: BASE_URL, timeout: 60000 });

api.interceptors.request.use(async (config) => {
  let deviceId = await AsyncStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem('device_id', deviceId);
  }
  config.headers['x-device-id'] = deviceId;
  return config;
});

export const getDaily = () => api.get('/daily');
export const postInteraction = (type: string, buttonId: string) => api.post('/interaction', { userId: 'anon', type, message: buttonId });
export const postDeep = (interaction_id: string, user_choice: string) => api.post('/interaction/deep', { interaction_id, user_choice });
export const postOnboarding = (answers: { question_key: string; answer: string }[]) => api.post('/onboarding', { answers });
export const searchBible = (q: string) => api.get(`/bible/search?q=${encodeURIComponent(q)}`);
export const postAction = (verse: string, action: string) =>
  api.post('/action', { userId: 'anon', verse, interaction_type: 'feedback', action });

export const getPlans = () => api.get('/plans');
export const getPlanProgress = (userId: string) => api.get(`/plan/progress?userId=${encodeURIComponent(userId)}`);
export const startPlan = (planId: string, userId: string) => api.post('/plan/start', { userId, planId });
export const completePlanDay = (planId: string, day: number, userId: string) =>
  api.post('/plan/complete-day', { userId, planId, day, action_done: true });

export const getInteractionsHistory = () => api.get('/interactions/history');

export const getProfile = async () => {
  let deviceId = await AsyncStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem('device_id', deviceId);
  }
  return api.get(`/user/profile?userId=${deviceId}`);
};