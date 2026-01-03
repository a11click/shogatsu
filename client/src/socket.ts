import type { ClientToServerEvents, ServerToClientEvents } from "server";
import { io, type Socket } from "socket.io-client";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "/",
  {
    path:"/api/socket.io/",
    withCredentials: true,
    autoConnect: false,
  },
);
