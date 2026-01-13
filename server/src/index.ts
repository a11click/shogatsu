import { serve } from "@hono/node-server";
import api from "./api.js";
import { parse } from "cookie";
import { Server } from "socket.io";
import {
  applyGameAction,
  checkRole,
  createRoom,
  disconnectHost,
  joinRoom,
  playAgain,
  ready,
  reconnectHost,
  removeGuest,
  type PlayerRole,
  type MochitsukiRole,
  type Room,
} from "./room.js";
import {
  poundMochi,
  turnEndMochi,
  turnStartMochi,
  type MochitsukiActionFunc,
} from "./mochi.js";
import { JWT_SECRET, PORT, tokenSchema } from "./schema.js";
import { verify } from "hono/jwt";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const app = new Hono();

app.route("/", api);

if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "../client/dist" }));

  app.use(
    "*",
    serveStatic({
      root: "../client/dist",
      rewriteRequestPath: () => "/index.html",
    }),
  );
}

const httpServer = serve({
  fetch: app.fetch,
  port: PORT,
  hostname: process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1",
});

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer);

export interface ServerToClientEvents {
  room: (room: Room) => void;
}

export interface ClientToServerEvents {
  ready: () => void;

  pound: () => void;
  turnStart: () => void;
  turnEnd: () => void;

  playAgain: () => void;
}

export interface InterServerEvents {}

export interface SocketData {
  roomId: string;
  userId: string;
  role: PlayerRole;
}

io.use(async (socket, next) => {
  try {
    const cookie = parse(socket.request.headers.cookie ?? "");
    const token = cookie["room_id"];
    if (!token) return next(new Error("Authentication error"));

    const payload = await verify(token, JWT_SECRET, "HS256");
    const user = tokenSchema.parse(payload);

    socket.data = {
      roomId: user.roomId,
      userId: user.sub,
      role: user.role,
    };

    next();
  } catch (_e) {
    next(new Error("Unauthorized"));
  }
});

const roomMap = new Map<string, Room>();

const getRoom = (id: string): Room | null => roomMap.get(id) ?? null;

const saveRoom = (room: Room): void => {
  roomMap.set(room.id, room);
};

const deleteRoom = (id: string): void => {
  roomMap.delete(id);
};

const tryGameAction =
  (req: MochitsukiRole, actionFunc: MochitsukiActionFunc) =>
  (r: Room, role: PlayerRole): Room => {
    if (r.status !== "playing") return r;
    if (!checkRole(r.round, role, req)) {
      return r;
    }

    const now = Date.now();
    return applyGameAction(r, now, actionFunc);
  };

io.on("connection", (socket) => {
  const { roomId, role, userId } = socket.data;

  if (role === "guest") {
    const room = getRoom(roomId);
    if (!room || room.status !== "open") {
      socket.disconnect();
      return;
    }
    const newRoom = joinRoom(room, userId);
    saveRoom(newRoom);
    socket.join(roomId);

    io.to(roomId).emit("room", newRoom);
  }

  if (role === "host") {
    const room = getRoom(roomId);
    if (room && room.status !== "open") {
      const newRoom = reconnectHost(room);
      saveRoom(newRoom);
      socket.join(roomId);

      io.to(roomId).emit("room", newRoom);
    } else {
      const newRoom = createRoom(roomId, userId);
      saveRoom(newRoom);
      socket.join(roomId);

      io.to(roomId).emit("room", newRoom);
    }
  }

  const updateRoom = (updater: (r: Room) => Room) => {
    const room = getRoom(roomId);
    if (!room) return;

    const nextRoom = updater(room);
    saveRoom(nextRoom);
    io.to(roomId).emit("room", nextRoom);
  };

  socket.on("ready", () => {
    updateRoom((r) => (r.status === "ready" ? ready(r, role) : r));
  });

  socket.on("pound", () => {
    updateRoom((r) => tryGameAction("tsukite", poundMochi)(r, role));
  });

  socket.on("turnStart", () => {
    updateRoom((r) => tryGameAction("ainote", turnStartMochi)(r, role));
  });

  socket.on("turnEnd", () => {
    updateRoom((room) => tryGameAction("ainote", turnEndMochi)(room, role));
  });

  socket.on("playAgain", () => {
    updateRoom((room) =>
      room.status === "finished" ? playAgain(room, role) : room,
    );
  });

  socket.on("disconnect", () => {
    const room = getRoom(roomId);
    if (!room) return;

    const closeRoom = () => {
      deleteRoom(roomId);
      io.in(roomId).disconnectSockets(true);
    };

    const saveAndBroadcast = (updatedRoom: Room) => {
      io.to(roomId).emit("room", updatedRoom);
      saveRoom(updatedRoom);
    };

    if (role === "guest") {
      if (room.status === "open") {
        return;
      }

      if (!room.players.host.isConnected) {
        closeRoom();
        return;
      }

      const newRoom = removeGuest(room);
      saveAndBroadcast(newRoom);
      return;
    }

    if (role === "host") {
      if (room.status === "open") {
        closeRoom();
        return;
      }
      const newRoom = disconnectHost(room);
      saveAndBroadcast(newRoom);
      return;
    }
  });
});
