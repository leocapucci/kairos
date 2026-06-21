import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  useAuth as useClerkAuth,
  useOAuth,
  useSignIn,
  useUser,
} from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';

import { identify } from '../analytics';
import { BASE_URL } from '../services/api/http';
import type { AuthState, AuthUser } from './types';

WebBrowser.maybeCompleteAuthSession();

const DEVICE_ID_KEY = 'kairos_device_id_v1';

function makeId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function getOrCreateDeviceId(): Promise<string> {
  try {
    let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = `k_${makeId()}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return `k_${makeId()}`;
  }
}

type AuthContextValue = AuthState & {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: (user: AuthUser) => void;
  getUserId: () => string;
  isGoogleAvailable: boolean;
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (code: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUser: () => {},
  getUserId: () => '',
  isGoogleAvailable: true,
  sendEmailOtp: async () => {},
  verifyEmailOtp: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, signOut: clerkSignOut, isLoaded, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { signIn, setActive: setSignInActive } = useSignIn();

  const [deviceId, setDeviceId] = useState<string>('');
  const syncedRef = useRef(false);
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && clerkUser) {
      const user: AuthUser = {
        user_id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        name: clerkUser.fullName ?? undefined,
        avatar_url: clerkUser.imageUrl ?? undefined,
        provider: clerkUser.externalAccounts.length > 0 ? 'google' : 'email',
      };
      setState({ user, isAuthenticated: true, isLoading: false });
      identify(user.user_id, { email: user.email, provider: user.provider });
    } else if (isLoaded && !isSignedIn) {
      setState({
        user: deviceId ? { user_id: deviceId, provider: 'anonymous' } : null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [isSignedIn, clerkUser, isLoaded, deviceId]);

  // Sincroniza dados anônimos (device_id) com a conta recém-autenticada
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser || !deviceId) return;
    if (syncedRef.current) return;
    syncedRef.current = true;

    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        await fetch(`${BASE_URL}/auth/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ device_id: deviceId }),
        });
      } catch (e) {
        console.error('[auth/sync] falhou:', e);
      }
    })();
  }, [isLoaded, isSignedIn, clerkUser, deviceId, getToken]);

  const signInWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: makeRedirectUri({ scheme: 'kairos' }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (e) {
      console.error('Google OAuth error:', e);
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [startOAuthFlow]);

  const sendEmailOtp = useCallback(async (email: string) => {
    if (!signIn) throw new Error('signIn não disponível');
    await signIn.create({ strategy: 'email_code', identifier: email });
  }, [signIn]);

  const verifyEmailOtp = useCallback(async (code: string) => {
    if (!signIn || !setSignInActive) throw new Error('signIn não disponível');
    const result = await signIn.attemptFirstFactor({
      strategy: 'email_code',
      code,
    });
    if (result.status === 'complete' && result.createdSessionId) {
      await setSignInActive({ session: result.createdSessionId });
    }
  }, [signIn, setSignInActive]);

  const signOut = useCallback(async () => {
    syncedRef.current = false;
    await clerkSignOut();
  }, [clerkSignOut]);

  const refreshUser = useCallback((user: AuthUser) => {
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const getUserId = useCallback((): string => {
    return state.user?.user_id ?? deviceId;
  }, [state.user, deviceId]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signOut,
        refreshUser,
        getUserId,
        isGoogleAvailable: true,
        sendEmailOtp,
        verifyEmailOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
