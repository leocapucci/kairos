import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, post } from '../services/api/http';
import type { AuthSession, AuthState, AuthUser } from './types';

const SESSION_KEY = 'kairos_auth_session_v1';
const DEVICE_ID_KEY = 'kairos_device_id_v1';

function makeId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Generated immediately at module load — used as fallback before initAuth() completes.
// If AsyncStorage has no persistent ID, this same value is stored as the device ID,
// so there is never a mismatch between pre-init calls and post-init calls.
const MODULE_ID = `k_${makeId()}`;
let _userId: string = MODULE_ID;
let _initialized = false;

// ─── Public getters ───────────────────────────────────────────────────────────

export function getUserId(): string {
  return _userId;
}

export function isAuthInitialized(): boolean {
  return _initialized;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function initAuth(): Promise<AuthState> {
  // 1. Try to restore an authenticated session
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw) as AuthSession;
      _userId = session.user.user_id;
      _initialized = true;
      return { user: session.user, isAuthenticated: true, isLoading: false };
    }
  } catch {}

  // 2. Restore or create persistent anonymous device ID
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // Reuse the module-level ID so any calls made before this point are consistent
      deviceId = MODULE_ID;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    _userId = deviceId;
  } catch {}

  _initialized = true;
  return {
    user: { user_id: _userId, provider: 'anonymous' },
    isAuthenticated: false,
    isLoading: false,
  };
}

// ─── Session management ───────────────────────────────────────────────────────

export async function saveSession(user: AuthUser, token?: string): Promise<void> {
  const previousId = _userId;
  _userId = user.user_id;
  const session: AuthSession = { user, token };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Migrate all anonymous data to the authenticated user
  if (previousId && previousId !== user.user_id) {
    linkDevice(previousId, user.user_id).catch(() => {});
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
  // After sign-out, restore the persistent device ID
  const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY).catch(() => null);
  _userId = deviceId ?? `k_${makeId()}`;
}

// ─── Google Sign-In ───────────────────────────────────────────────────────────

export async function signInWithGoogleToken(accessToken: string): Promise<AuthUser> {
  const res = await post<{ user: AuthUser; token?: string }>(`${BASE_URL}/auth/google`, {
    access_token: accessToken,
    device_id: _userId,
  });
  await saveSession(res.user, res.token);
  return res.user;
}

// ─── Email OTP ────────────────────────────────────────────────────────────────

export async function requestEmailOtp(email: string): Promise<void> {
  await post(`${BASE_URL}/auth/email/request`, { email, user_id: _userId });
}

export async function verifyEmailOtp(email: string, otp: string): Promise<AuthUser> {
  const res = await post<{ user: AuthUser; token?: string }>(`${BASE_URL}/auth/email/verify`, {
    email,
    otp,
    device_id: _userId,
  });
  await saveSession(res.user, res.token);
  return res.user;
}

// ─── Sign-Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await clearSession();
}

// ─── Device migration ─────────────────────────────────────────────────────────

async function linkDevice(deviceId: string, userId: string): Promise<void> {
  await post(`${BASE_URL}/auth/link-device`, { device_id: deviceId, user_id: userId });
}
