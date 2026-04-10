import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, registerUser } from "@/lib/api";

export type UserRole = "student" | "mentor";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('eduvia_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await loginUser({ email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('eduvia_token', token);
      localStorage.setItem('eduvia_user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      const res = await registerUser({ name, email, password, career_goal: role });
      const { token, user: userData } = res.data;
      localStorage.setItem('eduvia_token', token);
      localStorage.setItem('eduvia_user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Signup failed:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('eduvia_token');
    localStorage.removeItem('eduvia_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}