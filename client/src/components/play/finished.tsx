import type { FinishedRoom, MochitsukiResult, PlayerRole } from "server/src/room";
import { socket } from "../../socket";
import { Button} from "../button";
import clsx from "clsx";
import type { MouseEventHandler } from "react";
import { client } from "../../hc";
import { useNavigate } from "react-router";
import { Heading } from "../heading";

const ResultDiv: React.FC<{ result: MochitsukiResult }> = ({ result }) => {
  return (
    <div className="mb-6 rounded-lg bg-gray-50 p-4">
      <Heading className="mb-2">結果</Heading>
      {result.isOk ? (
        <p className="text-center font-mono text-2xl text-green-600">
          {result.time / 1000}秒
        </p>
      ) : (
        <p className="text-center text-xl font-bold text-red-500">失敗...</p>
      )}
    </div>
  );
};

const PlayAgainButton = ({ isPlayAgain }: { isPlayAgain: boolean }) => {
  return (
    <Button
      type="button"
      onClick={() => {
        console.log("ready click");
        socket.emit("playAgain");
      }}
      className={clsx(
        "mb-4",
        isPlayAgain
          ? "bg-gray-300 text-gray-900"
          : "bg-red-700 text-white hover:bg-red-600",
      )}
    >
      準備OK
    </Button>
  );
};

const LeaveButton = () => {
  const navigate = useNavigate();
  const handleClick: MouseEventHandler = async () => {
    await client.api.auth.role.$delete();
    navigate("/");
  };

  return (
    <Button className="bg-gray-300 hover:bg-gray-200" onClick={handleClick}>
      退出
    </Button>
  );
};

const ButtonDiv = ({
  isPlayAgain,
  role,
}: {
  isPlayAgain: boolean;
  role: PlayerRole;
}) => {
  return (
    <>
      <p className="mb-4 text-center font-bold text-gray-700">
        {isPlayAgain
          ? `${role === "host" ? "ゲスト" : "ホスト"}を待っています…`
          : "選択待ち…"}
      </p>
      <PlayAgainButton isPlayAgain={isPlayAgain} />
      <LeaveButton />
    </>
  );
};

interface FinishedScreenProps {
  room: FinishedRoom;
  role: PlayerRole;
}
const FinishedScreen = ({ room, role }: FinishedScreenProps) => {
  return (
    <>
      <ResultDiv result={room.result} />
      <ButtonDiv isPlayAgain={room.players[role].isPlayAgain} role={role} />
    </>
  );
};

export default FinishedScreen;
