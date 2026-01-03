import type { PlayingRoom, Role } from "server/src/room";
import { socket } from "../socket";
import type { ComponentProps } from "react";
import clsx from "clsx";

const Button = ({ className, ...props }: ComponentProps<"button">) => (
  <button
    {...props}
    className={clsx(
      "min-h-24 flex items-center justify-center w-full font-bold text-3xl rounded-full",
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
        className=" text-white bg-blue-700"
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
      className="text-white bg-yellow-700"
    >
      かえす(長押し)
    </Button>
  );
};

export default ActionPanel;
