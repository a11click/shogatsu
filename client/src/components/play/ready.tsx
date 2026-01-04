import clsx from "clsx";
import { socket } from "../../socket";
import { Button } from "../button";
import type { PlayerRole } from "server/src/room";

const getPartnerRole = (role: PlayerRole): PlayerRole =>
  role === "host" ? "guest" : "host";
const ROLE_TEXT = {
  host: "ホスト",
  guest: "ゲスト",
} satisfies Record<PlayerRole, string>;

interface ReadyScreenProps {
  isReady: boolean;
  role: PlayerRole;
}
const ReadyScreen = ({ isReady, role }: ReadyScreenProps) => {
  const partnerRole = getPartnerRole(role);

  return (
    <>
      <p className="mb-4 text-center text-lg font-bold text-gray-700">
        {isReady ? `${ROLE_TEXT[partnerRole]}を待っています…` : "準備待ち…"}
      </p>
      <Button
        type="button"
        onClick={() => {
          console.log("ready click");
          socket.emit("ready");
        }}
        className={clsx(
          isReady
            ? "bg-gray-300 text-gray-900"
            : "bg-red-700 text-white hover:bg-red-600",
        )}
      >
        準備OK
      </Button>
    </>
  );
};

export default ReadyScreen;
