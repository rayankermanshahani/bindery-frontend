// src/hooks/useSocket.ts
import { useEffect, useMemo, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketProps {
  token: string | null;
}

export function useSocket({ token }: UseSocketProps) {
  // store reference to socket instance so it doesn't cause re-renders
  const socketRef = useRef<Socket | null>(null);

  // only create socket once when `token` changes
  const socket = useMemo(() => {
    if (!token) return null; // no token => no socket
    const baseUrl = import.meta.env.VITE_API_URL;

    const s = io(baseUrl, {
      extraHeaders: {},
      auth: { token },
    });

    return s;
  }, [token]);

  useEffect(() => {
    // on mount or token change
    if (socket) {
      console.log("Socket.io connected");
      socket.on("connect", () => {
        console.log("Socket connected, ID:", socket.id);
      });
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
      socket.on("error", (data) => {
        console.warn("Socket error:", data);
      });
    }

    // cleanup on unmount or token change
    return () => {
      if (socket) {
        console.log("Disconnecting socket...");
        socket.disconnect();
      }
    };
  }, [socket]);

  // keep ref updated
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  return socketRef.current;
}
