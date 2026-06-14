import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
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

// Only include client IDs that are actually set — passing undefined for a platform-specific
// ID causes expo-auth-session to throw "must be defined" on that platform.
const GOOGLE_WEB     = '952095468133-3eub9k8rr38ut8ge28veqpfbsp6k9ndg.apps.googleusercontent.com';
const GOOGLE_IOS     = undefined as string | undefined;
const GOOGLE_ANDROID = '952095468133-2qcrme2keha057e6tv3p40vh82p2j64l.apps.googleusercontent.com';
const GOOGLE_AVAILABLE = !!(GOOGLE_WEB || GOOGLE_IOS || GOOGLE_ANDROID);

// Android OAuth clients identify the app by package + SHA-1 and expect the redirect
// on the reversed client-ID scheme. Make it explicit so the APK build doesn't fall
// back to an exp:// proxy URI, which Google rejects with 400 invalid_request.
const redirectUri = makeRedirectUri({
  native: 'com.googleusercontent.apps.952095468133-2qcrme2keha057e6tv3p40vh82p2j64l:/oauth2redirect',
});

type AuthContextValue = AuthState & {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: (user: AuthUser) => void;
  getUserId: () => string;
  isGoogleAvailable: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUser: () => {},
  getUserId: () => '',
  isGoogleAvailable: GOOGLE_AVAILABLE,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    ...(GOOGLE_WEB     && { clientId:       GOOGLE_WEB }),
    ...(GOOGLE_IOS     && { iosClientId:    GOOGLE_IOS }),
    ...(GOOGLE_ANDROID && { androidClientId: GOOGLE_ANDROID }),
    redirectUri,
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
    if (!request || !GOOGLE_AVAILABLE) return;
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
    <AuthContext.Provider value={{ ...state, signInWithGoogle, signOut, refreshUser, getUserId, isGoogleAvailable: GOOGLE_AVAILABLE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
