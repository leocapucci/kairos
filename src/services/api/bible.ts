import { request } from './http';

export const getDailyVerse = () =>
  request('https://kairos-backend-vjdp.onrender.com/daily');
