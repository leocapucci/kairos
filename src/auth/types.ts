export type AuthProvider = 'google' | 'email' | 'anonymous';

export type AuthUser = {
  user_id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  provider: AuthProvider;
};

export type AuthSession = {
  user: AuthUser;
  token?: string;
};

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};
