import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('merch_auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  // Check if user is authenticated on app load
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔍 AuthContext: Initializing authentication...');
      
      // Skip init if we're processing OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('token') || urlParams.get('error')) {
        console.log('🔍 OAuth callback detected, skipping init auth');
        return;
      }
      
      const storedToken = localStorage.getItem('merch_auth_token');
      const storedUser = localStorage.getItem('merch_user');

      console.log('🔍 Stored auth data:', { 
        hasToken: !!storedToken, 
        hasUser: !!storedUser,
        tokenLength: storedToken ? storedToken.length : 0
      });

      if (storedToken && storedUser) {
        try {
          console.log('🔍 Verifying stored token...');
          // Verify token is still valid
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: storedToken }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('🔍 Token verification result:', result);
            if (result.success) {
              console.log('✅ Token valid, restoring user session');
              setToken(storedToken);
              setUser(JSON.parse(storedUser));
            } else {
              console.log('❌ Token invalid, clearing storage');
              // Token invalid, clear storage
              localStorage.removeItem('merch_auth_token');
              localStorage.removeItem('merch_user');
            }
          } else {
            console.log('❌ Token verification failed with status:', response.status);
          }
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          localStorage.removeItem('merch_auth_token');
          localStorage.removeItem('merch_user');
        }
      } else {
        console.log('🔍 No stored auth data found');
      }
      
      console.log('✅ Auth initialization complete');
      setIsLoading(false);
    };

    initAuth();
  }, [API_BASE_URL]);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('🔍 AuthContext: Checking for OAuth callback...');
      console.log('🔍 Current URL:', window.location.href);
      console.log('🔍 Search params:', window.location.search);
      
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userStr = urlParams.get('user');
      const error = urlParams.get('error');
      
      console.log('🔍 OAuth callback params:', { 
        hasToken: !!token, 
        hasUser: !!userStr, 
        hasError: !!error,
        tokenLength: token ? token.length : 0,
        userLength: userStr ? userStr.length : 0
      });
      
      if (error) {
        console.error('❌ OAuth error:', error);
        const message = urlParams.get('message');
        alert(`Login failed: ${message || error}`);
        window.history.replaceState({}, document.title, '/');
        setIsLoading(false);
        return;
      }
      
      if (token && userStr) {
        try {
          console.log('✅ Processing OAuth success...');
          setIsLoading(true); // Set loading while processing
          
          const userData = JSON.parse(decodeURIComponent(userStr));
          console.log('✅ Parsed user data:', userData);
          
          setToken(token);
          setUser(userData);
          localStorage.setItem('merch_auth_token', token);
          localStorage.setItem('merch_user', JSON.stringify(userData));
          
          console.log('✅ Auth state updated, clearing URL...');
          // Clear URL parameters and redirect to main app
          window.history.replaceState({}, document.title, '/');
          console.log('✅ OAuth callback processing complete!');
          
          setIsLoading(false);
        } catch (error) {
          console.error('❌ Failed to parse user data:', error);
          window.history.replaceState({}, document.title, '/');
          setIsLoading(false);
        }
      } else if (window.location.search) {
        console.log('⚠️ URL has search params but no token/user found');
      }
    };

    handleOAuthCallback();
  }, []);

  const login = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`);
      const result = await response.json();
      
      if (result.success) {
        window.location.href = result.data.authUrl;
      } else {
        throw new Error(result.error || 'Failed to get OAuth URL');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('merch_auth_token');
      localStorage.removeItem('merch_user');
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  // Debug logging for auth state changes
  console.log('🔍 AuthContext state:', {
    hasToken: !!token,
    hasUser: !!user,
    isAuthenticated: !!token && !!user,
    isLoading,
    userName: user?.name,
    tokenLength: token ? token.length : 0
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
