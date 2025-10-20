import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 

// Define the shape of the user data we'll get from the token
interface User {
  sub: string; // Subject (user ID)
  // Add other claims like username if you include them in your JWT
}

// Define the shape of our context's value
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

// This is the provider component that will wrap our application
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // This useEffect runs once when the component first loads
  useEffect(() => {
    // Check localStorage for an existing token
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        // If a token exists, decode it to get user info and check expiration
        const decodedUser: User & { exp: number } = jwtDecode(storedToken);
        if (decodedUser.exp * 1000 > Date.now()) {
          // If token is not expired, set the auth state
          setToken(storedToken);
          setUser(decodedUser);
        } else {
          // If token is expired, remove it
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error("Invalid token found in storage", error);
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = (newToken: string) => {
    // When login is called, store the token, decode the user, and update state
    localStorage.setItem('authToken', newToken);
    const decodedUser: User = jwtDecode(newToken);
    setToken(newToken);
    setUser(decodedUser);
  };

  const logout = () => {
    // When logout is called, clear everything
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  // The value provided to the context's children
  const value = {
    isAuthenticated: !!token, // isAuthenticated is true if a token exists
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// This is our custom hook that components will use to access the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};