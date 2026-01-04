import type { MochitsukiRole, PlayerRole } from "server/src/room";

export const getMochitsukiRole = (
  round: number,
  role: PlayerRole,
): MochitsukiRole => {
  const isHost = role === "host";

  if (round % 2 !== 0) {
    return isHost ? "tsukite" : "ainote";
  }

  return isHost ? "ainote" : "tsukite";
};

export const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
