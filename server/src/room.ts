import {
  initializeMochi,
  type Mochi,
  type MochitsukiActionFunc,
} from "./mochi.js";

interface Player {
  id: string;
  isConnected: boolean;
}

interface ReadyPlayer extends Player {
  isReady: boolean;
}

interface FinishedPlayer extends Player {
  isPlayAgain: boolean;
}

const finishedPlayer = (player: Player): FinishedPlayer => ({
  ...player,
  isPlayAgain: false,
});

interface RoomBase {
  id: string;
  status: "open" | "ready" | "playing" | "finished";
  players: {
    host: Player;
  };
}

interface OpenRoom extends RoomBase {
  status: "open";
}

interface TwoPlayerRoom extends RoomBase {
  status: "ready" | "playing" | "finished";
  round: number;
  players: {
    host: Player;
    guest: Player;
  };
  best?: number;
}

export type PlayerRole = keyof TwoPlayerRoom["players"];

interface ReadyRoom extends TwoPlayerRoom {
  status: "ready";
  players: {
    host: ReadyPlayer;
    guest: ReadyPlayer;
  };
}

export interface PlayingRoom extends TwoPlayerRoom {
  status: "playing";
  players: {
    host: Player;
    guest: Player;
  };
  mochi: Mochi;
}

export type MochitsukiResult = { isOk: true; time: number } | { isOk: false };

export interface FinishedRoom extends TwoPlayerRoom {
  status: "finished";
  players: {
    host: FinishedPlayer;
    guest: FinishedPlayer;
  };
  result: MochitsukiResult;
}

export type Room = OpenRoom | ReadyRoom | PlayingRoom | FinishedRoom;

export const createRoom = (roomId: string, userId: string): OpenRoom => ({
  id: roomId,
  status: "open",
  players: {
    host: { id: userId, isConnected: true },
  },
});

export const joinRoom = (room: OpenRoom, userId: string): ReadyRoom => ({
  ...room,
  status: "ready",
  round: 0,
  players: {
    host: { isReady: false, ...room.players.host },
    guest: { id: userId, isReady: false, isConnected: true },
  },
});

export const reconnectHost = <T extends TwoPlayerRoom>(room: T): T => {
  return {
    ...room,
    players: {
      ...room.players,
      host: { ...room.players.host, isConnected: true },
    },
  };
};

export const disconnectHost = <T extends TwoPlayerRoom>(room: T): T => {
  return {
    ...room,
    players: {
      ...room.players,
      host: { ...room.players.host, isConnected: false },
    },
  };
};

export const removeGuest = (room: TwoPlayerRoom): OpenRoom => {
  const { id, isConnected } = room.players.host;
  return {
    ...room,
    status: "open",
    players: {
      host: { id, isConnected },
    },
  };
};

const updatePlayer = <T extends TwoPlayerRoom>(
  room: T,
  role: PlayerRole,
  mapper: (current: T["players"][PlayerRole]) => T["players"][PlayerRole],
): T => ({
  ...room,
  players: {
    ...room.players,
    [role]: mapper(room.players[role]),
  },
});

const readyPlayer = (p: ReadyPlayer): ReadyPlayer => ({
  ...p,
  isReady: true,
});

const createPlayingRoom = (r: ReadyRoom): PlayingRoom => {
  const { isReady: _hostIsReady, ...host } = r.players.host;
  const { isReady: _guestIsReady, ...guest } = r.players.guest;
  return {
    ...r,
    status: "playing",
    round: r.round + 1,
    players: {
      host: { ...host },
      guest: { ...guest },
    },
    mochi: initializeMochi(),
  };
};

export const ready = (
  room: ReadyRoom,
  role: PlayerRole,
): ReadyRoom | PlayingRoom => {
  const updatedRoom = updatePlayer(room, role, readyPlayer);

  if (
    !(updatedRoom.players.host.isReady && updatedRoom.players.guest.isReady)
  ) {
    return updatedRoom;
  }

  return createPlayingRoom(updatedRoom);
};

const finishedRoom = (
  room: PlayingRoom,
  result: MochitsukiResult,
): FinishedRoom => {
  const { mochi: _mochi, best, ...r } = room;

  const newBest =
    result.isOk && (best === undefined || result.time < best)
      ? result.time
      : best;

  return {
    ...r,
    status: "finished",
    players: {
      host: finishedPlayer(room.players.host),
      guest: finishedPlayer(room.players.guest),
    },
    result,
    best: newBest,
  };
};

export const applyGameAction = (
  room: PlayingRoom,
  now: number,
  actionFunc: MochitsukiActionFunc,
): PlayingRoom | FinishedRoom => {
  const result = actionFunc(room.mochi, now);
  if (!result.isOk) {
    return finishedRoom(room, { isOk: false });
  }

  const { mochi } = result;

  const isFinished = mochi.count >= 30;
  if (isFinished) {
    return finishedRoom(room, { isOk: true, time: now - mochi.start });
  }

  return {
    ...room,
    mochi: mochi,
  };
};

const playAgainPlayer = (p: FinishedPlayer): FinishedPlayer => ({
  ...p,
  isPlayAgain: true,
});

const readyRoom = (finishedRoom: FinishedRoom): ReadyRoom => {
  const { result: _, ...r } = finishedRoom;
  const { isPlayAgain: _hostIsPlayAgain, ...host } = r.players.host;
  const { isPlayAgain: _guestIsPlayAgain, ...guest } = r.players.guest;

  return {
    ...r,
    status: "ready",
    players: {
      host: { isReady: false, ...host },
      guest: { isReady: false, ...guest },
    },
  };
};

export const playAgain = (
  room: FinishedRoom,
  role: PlayerRole,
): FinishedRoom | ReadyRoom => {
  const updatedRoom = updatePlayer(room, role, playAgainPlayer);

  if (
    !(
      updatedRoom.players.host.isPlayAgain &&
      updatedRoom.players.guest.isPlayAgain
    )
  ) {
    return updatedRoom;
  }

  return readyRoom(updatedRoom);
};

export type MochitsukiRole = "tsukite" | "ainote";
export const checkRole = (
  round: number,
  actor: PlayerRole,
  req: MochitsukiRole,
): boolean => {
  const currentTsukite = round % 2 !== 0 ? "host" : "guest";
  if (req === "tsukite") {
    return actor === currentTsukite;
  } else {
    return actor !== currentTsukite;
  }
};
