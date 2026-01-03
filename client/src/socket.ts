import type { ClientToServerEvents, ServerToClientEvents } from "server";
import { io, type Socket } from "socket.io-client";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_API_URL,
  {
    withCredentials: true,
    autoConnect: false,
  },
);
