import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { identify } from '../analytics';
import {
  clearSession,
  getUserId,
  initAuth,
  signInWithGoogleToken,
} from './authService';
import type { AuthState, AuthUser } from './types';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = AuthState & {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: (user: AuthUser) => void;
  getUserId: () => string;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUser: () => {},
  getUserId: () => '',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  });

  // Restore session on mount
  useEffect(() => {
    initAuth().then((s) => {
      setState(s);
      if (s.user) {
        identify(s.user.user_id, { provider: s.user.provider, email: s.user.email });
      }
    });
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type !== 'success') return;
    const token = response.authentication?.accessToken;
    if (!token) return;
    signInWithGoogleToken(token)
      .then((user) => {
        setState({ user, isAuthenticated: true, isLoading: false });
        identify(user.user_id, { email: user.email, provider: 'google' });
      })
      .catch(() => setState((s) => ({ ...s, isLoading: false })));
  }, [response]);

  const signInWithGoogle = useCallback(async () => {
    if (!request) return;
    setState((s) => ({ ...s, isLoading: true }));
    try {
      await promptAsync();
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [request, promptAsync]);

  const signOut = useCallback(async () => {
    await clearSession();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const refreshUser = useCallback((user: AuthUser) => {
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signInWithGoogle, signOut, refreshUser, getUserId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
