// src/components/Login.tsx
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      console.log(
        "Initializing with client ID:",
        import.meta.env.VITE_GOOGLE_CLIENT_ID,
      ); // TODO: remove debugging log
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin")!,
        { theme: "outline", size: "large" },
      );
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = initializeGoogleSignIn;
    script.async = true;
    script.defer = true;
    document.querySelector("head")?.appendChild(script);

    return () => {
      document.querySelector("head")?.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    console.log("Google response received:", response); // TODO: remove debugging log
    try {
      console.log("Sending credential to backend:", response.credential); // TODO: remove debugging log
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          credential: response.credential,
        },
      );

      login(res.data.token, {
        id: res.data.user_id,
        username: res.data.username,
        created_at: new Date().toISOString(), // TODO: update this when we fetch the full profile
      });
      console.log("Login successful, auth context updated"); // TODO: remove debugging log

      // redirect to profile page upon successful login
      navigate("/profile");
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-5xl font-extrabold text-gray-900">
            Bindery
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            a little place for books
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <div id="google-signin"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
