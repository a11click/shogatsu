import type { PlayingRoom, Role } from "server/src/room";
import { socket } from "../socket";
import type { ComponentProps } from "react";
import clsx from "clsx";

const Button = ({ className, ...props }: ComponentProps<"button">) => (
  <button
    {...props}
    className={clsx(
      "flex min-h-24 w-full items-center justify-center rounded-full text-3xl font-bold",
      className,
    )}
  />
);

const ActionPanel: React.FC<{
  room: PlayingRoom;
  role: Role;
}> = ({ room, role }) => {
  const isPounder =
    (role === "host" && room.round % 2 !== 0) ||
    (role === "guest" && room.round % 2 === 0);

  if (isPounder) {
    return (
      <Button
        onClick={() => socket.emit("pound")}
        className="bg-blue-700 text-white"
      >
        つく
      </Button>
    );
  }

  return (
    <Button
      onPointerDown={() => socket.emit("turnStart")}
      onPointerUp={() => socket.emit("turnEnd")}
      onPointerCancel={() => socket.emit("turnEnd")}
      onPointerCancelCapture={() => socket.emit("turnEnd")}
      style={{ touchAction: "none" }}
      className="bg-yellow-700 text-white"
    >
      かえす(長押し)
    </Button>
  );
};

export default ActionPanel;
