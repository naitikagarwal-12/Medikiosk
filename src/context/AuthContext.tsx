import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

export type Role = "admin" | "physician" | "jan_aushadhi" | "patient";

export interface AuthUser {
  username: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (role: Role, username: string, password: string) => Promise<boolean>;
  signupPatient: (name: string, mobile: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "medikiosk_auth_user";

function loadUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = useCallback(
    async (role: Role, username: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role, username, password }),
        });

        const data = await response.json();

        if (data.success && data.data) {
          const authUser: AuthUser = {
            username: data.data.user.username,
            name: data.data.user.name,
            role: data.data.user.role,
          };
          setUser(authUser);
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          if (data.data.accessToken) {
            localStorage.setItem("medikiosk_access_token", data.data.accessToken);
          }
          if (data.data.refreshToken) {
            localStorage.setItem("medikiosk_refresh_token", data.data.refreshToken);
          }
          return true;
        }

        return false;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signupPatient = useCallback(
    async (name: string, mobile: string): Promise<boolean> => {
      const trimmedName = name.trim();
      const trimmedMobile = mobile.trim();

      if (!trimmedName || trimmedMobile.length < 10) return false;

      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/api/auth/patient/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: trimmedName, mobile: trimmedMobile }),
        });

        const data = await response.json();

        if (data.success && data.data) {
          const authUser: AuthUser = {
            username: trimmedMobile,
            name: data.data.name,
            role: "patient",
          };
          setUser(authUser);
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          return true;
        }

        return false;
      } catch (error) {
        console.error("Signup error:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    fetch("http://localhost:3001/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("medikiosk_access_token");
    localStorage.removeItem("medikiosk_refresh_token");
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3001/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("medikiosk_access_token")}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        const authUser: AuthUser = {
          username: data.data.username,
          name: data.data.name,
          role: data.data.role,
        };
        setUser(authUser);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, signupPatient, logout, refreshUser }),
    [user, isLoading, login, signupPatient, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  physician: "/physician",
  jan_aushadhi: "/dispensary",
  patient: "/opd",
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  physician: "Doctor",
  jan_aushadhi: "Jan Aushadhi",
  patient: "Patient",
};
