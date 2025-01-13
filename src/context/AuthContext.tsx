// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User, AuthState } from "../types/auth";
import axios from "axios";

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "LOGIN"; payload: { token: string; user: User } }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: { user: User } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload.user,
        token: action.payload.token,
      };
    case "LOGOUT":
      return {
        user: null,
        token: null,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem("token"),
  });

  useEffect(() => {
    if (state.token) {
      localStorage.setItem("token", state.token);
      axios // fetch user data from api
        .get(`${import.meta.env.VITE_API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        })
        .then((response) => {
          const fetchedUser: User = {
            id: response.data.id,
            username: response.data.username,
            created_at: response.data.created_at,
          };
          dispatch({ type: "SET_USER", payload: { user: fetchedUser } });
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
          dispatch({ type: "LOGOUT" }); // clear authentication if fetching fails
        });
    } else {
      localStorage.removeItem("token");
    }
  }, [state.token]);

  const login = (token: string, user: User) => {
    dispatch({ type: "LOGIN", payload: { token, user } });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const setUser = (user: User) => {
    dispatch({ type: "SET_USER", payload: { user } });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
