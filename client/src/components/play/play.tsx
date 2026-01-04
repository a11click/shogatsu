import {
  ArrowLeftStartOnRectangleIcon,
  ArrowPathRoundedSquareIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type {
  Room,
  PlayerRole,
  MochitsukiRole,
  PlayingRoom,
} from "server/src/room";
import { useState, useEffect } from "react";
import Open from "./open";
import MochiImg from "../mochi-img";
import FinishedScreen from "./finished";
import ReadyScreen from "./ready";
import PlayButtonPanel from "../mochitsuki-button";
import type { Mochi } from "server/src/mochi";
import clsx from "clsx";
import { getMochitsukiRole } from "../../room";
import { Button } from "../button";
import { client } from "../../hc";
import { useNavigate } from "react-router";

const ActionPanel: React.FC<{
  room: Exclude<Room, PlayingRoom>;
  role: PlayerRole;
}> = ({ room, role }) => {
  switch (room.status) {
    case "open":
      return <Open roomId={room.id} />;

    case "ready":
      return <ReadyScreen isReady={room.players[role].isReady} role={role} />;

    case "finished":
      return <FinishedScreen room={room} role={role} />;

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

const MochitsukiRole = ({
  mochitsukiRole,
}: {
  mochitsukiRole: MochitsukiRole;
}) => {
  return (
    <span className="flex items-center gap-x-1">
      <ArrowPathRoundedSquareIcon className="size-6" />{" "}
      <span>{mochitsukiRole === "tsukite" ? "つき手" : "合いの手"}</span>
    </span>
  );
};

const NextAction = ({
  status,
  mochitsukiRole,
}: {
  status: Mochi["status"];
  mochitsukiRole: MochitsukiRole;
}) => {
  const nextActionString = {
    initial: "クリックでつき始め！",
    pounded: "かえす！",
    turning: "かえし中…",
    turned: "つく！",
    failed_turn: "かえす！！",
  } satisfies Record<Mochi["status"], string>;

  const currentTurn =
    status === "initial" || status === "turned" ? "tsukite" : "ainote";

  const isMyTurn = mochitsukiRole === currentTurn;

  return (
    <span
      className={clsx(
        "mx-auto block min-h-6 w-fit rounded-full px-4 py-2 font-bold",
        mochitsukiRole === "tsukite" && isMyTurn && "bg-blue-100 text-blue-700",
        mochitsukiRole === "ainote" &&
          isMyTurn &&
          "bg-yellow-100 text-yellow-700",
        !isMyTurn && "bg-gray-100 text-gray-700",
      )}
    >
      {nextActionString[status]}
    </span>
  );
};

const GameHeader: React.FC<{ room: Room; role: PlayerRole }> = ({
  room,
  role,
}) => {
  const mochiTsukiRole =
    room.status === "playing" ? getMochitsukiRole(room.round, role) : undefined;
  const displayCount =
    room.status === "playing" && room.mochi.status !== "initial"
      ? 30 - room.mochi.count
      : 30;

  return (
    <header className="mb-8">
      <div className="mb-6 flex items-center justify-center font-bold">
        <div className="flex items-end gap-x-6">
          {mochiTsukiRole && <MochitsukiRole mochitsukiRole={mochiTsukiRole} />}
          <GameTimer room={room} />
          <p className="flex items-baseline gap-x-1">
            <span>あと</span>
            <span className="text-2xl"> {displayCount} </span>
            <span>回</span>
          </p>
        </div>
      </div>
      {room.status === "playing" ? (
        <NextAction
          status={room.mochi.status}
          mochitsukiRole={getMochitsukiRole(room.round, role)}
        />
      ) : (
        <p></p>
      )}
    </header>
  );
};

const LeaveDiv = () => {
  const navigate = useNavigate();

  const handleClick = async () => {
    await client.api.auth.role.$delete();
    navigate("/");
  };

  return (
    <div className="bg-yellow-100 p-4">
      <p className="mb-6 text-center font-bold text-gray-900">
        ホストが退出しました
      </p>
      <Button className="bg-yellow-500" onClick={handleClick}>
        退出 <ArrowLeftStartOnRectangleIcon className="size-6" />{" "}
      </Button>
    </div>
  );
};

export const GameScreen: React.FC<{ room: Room; role: PlayerRole }> = ({
  room,
  role,
}) => {
  return (
    <div className="flex h-full min-h-dvh w-full flex-col gap-y-8 py-8">
      {!room.players.host.isConnected && role === "guest" && <LeaveDiv />}
      <GameHeader room={room} role={role} />

      {room.status === "playing" ? (
        <MochiImg mochi={room.mochi} />
      ) : (
        <img src="/mochi.png" className="mx-auto w-1/3" />
      )}

      <section className="mt-auto">
        {room.status === "playing" ? (
          <PlayButtonPanel room={room} role={role} />
        ) : (
          <ActionPanel room={room} role={role} />
        )}
      </section>
    </div>
  );
};
