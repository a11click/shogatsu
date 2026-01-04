import { ClockIcon } from "@heroicons/react/24/outline";
import type { Room, Role } from "server/src/room";
import { useState, useEffect } from "react";
import PlayerJoinLink from "../copy-button";
import MochiImg from "../mochi-img";
import ResultView from "./finished";
import ReadyButton from "./ready";
import PlayButtonPanel from "../mochitsuki-button";

const ActionPanel: React.FC<{ room: Room; role: Role }> = ({ room, role }) => {
  switch (room.status) {
    case "open":
      return <PlayerJoinLink roomId={room.id} />;

    case "ready":
      return <ReadyButton isReady={room.players[role].isReady} />;

    case "playing":
      return null;

    case "finished":
      return <ResultView result={room.result} />;

    default:
      throw new Error(room satisfies never);
  }
};

const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const GameTimer: React.FC<{ room: Room }> = ({ room }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const mochiStart =
    room.status === "playing" && room.mochi.status !== "initial"
      ? room.mochi.start
      : 0;

  useEffect(() => {
    if (mochiStart === 0) {
      setElapsedSeconds(0);
      return;
    }

    let rafId: number;

    const loop = () => {
      const now = Date.now();
      const diff = Math.max(0, now - mochiStart);
      const currentSeconds = Math.floor(diff / 1000);

      setElapsedSeconds(currentSeconds);

      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(rafId);
  }, [mochiStart]);

  return (
    <span className="flex items-center gap-x-2">
      <ClockIcon className="size-6 text-gray-500" />
      <span className="tabular-nums">{formatDuration(elapsedSeconds)}</span>
    </span>
  );
};
const getGameMessage = (mochiStatus: string) => {
  switch (mochiStatus) {
    case "initial":
    case "turned":
      return "つく！";
    case "pounded":
      return "かえす！";
    case "turning":
      return "かえし中...";
    default:
      return "";
  }
};

const GameHeader: React.FC<{ room: Room }> = ({ room }) => {
  const isPlaying = room.status === "playing";

  const displayCount =
    room.status === "playing" && room.mochi.status !== "initial"
      ? 30 - room.mochi.count
      : 30;
  const displayMessage = isPlaying ? getGameMessage(room.mochi.status) : "";

  return (
    <header className="mb-8">
      <div className="flex items-center justify-center mb-6 text-xl font-bold">
        <div className="flex items-center gap-x-6">
          <GameTimer room={room} />
          <p className="flex items-baseline gap-x-1">
            {" "}
            <span>あと</span>
            <span className="text-2xl"> {displayCount} </span>
            <span>回</span>
          </p>
        </div>
      </div>
      <p className="text-center text-gray-600 min-h-6">{displayMessage}</p>
    </header>
  );
};

export const GameScreen: React.FC<{ room: Room; role: Role }> = ({
  room,
  role,
}) => {
  return (
  <div className="w-full h-full flex flex-col gap-y-8 min-h-dvh py-8">
     
          <GameHeader room={room} />

          {room.status === "playing" ? (
            <MochiImg mochi={room.mochi} />
          ) : (
            <img src="/mochi.png" className="mx-auto w-1/3" />
          )}

        <div className="mt-auto">
          {room.status === "playing" ? (
            <PlayButtonPanel room={room} role={role} />
          ) : (
            <ActionPanel room={room} role={role} />
          )}
        </div>
      </div>
  );
};
