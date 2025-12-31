import { io, Socket } from "socket.io-client";
import { getBaseUrl } from "./api";

let socket: Socket | null = null;

export function getRidersSocket(): Socket {
  if (socket) return socket;
  socket = io(getBaseUrl(), {
    path: "/ws/riders", // change if your FastAPI Socket.IO path differs
    transports: ["websocket"],
    withCredentials: true,
  });
  return socket;
}

