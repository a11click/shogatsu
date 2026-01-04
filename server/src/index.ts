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
  type Role,
  type RoleR,
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

const app = new Hono()

app.route("/",api)

if (process.env.NODE_ENV==="production") {
  app.use("/*", serveStatic({ root: "../client/dist" }));
  
  app.use("*", serveStatic({
    root:"../client/dist",
    rewriteRequestPath:()=>"/index.html"
  }))
}

const httpServer = serve({
  fetch: app.fetch,
  port: PORT,
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
  role: Role;
}

io.use(async (socket, next) => {
  try {
    const cookie = parse(socket.request.headers.cookie ?? "");
    const token = cookie["room_id"];
    if (!token) return next(new Error("Authentication error"));

    const payload = await verify(token, JWT_SECRET);
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
  (req: RoleR, actionFunc: MochitsukiActionFunc) =>
  (r: Room, role: Role): Room => {
    if (r.status !== "playing") return r;
    if (!checkRole(r.round, role, req)) {
      return r;
    }

    const now = Date.now();
    return applyGameAction(r, now, actionFunc);
  };

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.data.userId}`);
  const { roomId, role, userId } = socket.data;

  if (role === "guest") {
    const room = getRoom(roomId);
    console.log("guest connect", room);
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
      console.log("created", roomMap);

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
    updateRoom((r) => tryGameAction("pounder", poundMochi)(r, role));
  });

  socket.on("turnStart", () => {
    updateRoom((r) => tryGameAction("turner", turnStartMochi)(r, role));
  });

  socket.on("turnEnd", () => {
    updateRoom((room) => tryGameAction("turner", turnEndMochi)(room, role));
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
      console.log("deleted", roomMap);
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
