import clsx from "clsx";
import { socket } from "../../socket";
import { Button } from "../button";

interface ReadyButtonProps {
  isReady: boolean;
}
const Ready = ({ isReady }: ReadyButtonProps) => {
  return (
    <Button
      type="button"
      onClick={() => {
        console.log("ready click");
        socket.emit("ready");
      }}
      className={clsx(
        isReady
          ? "bg-gray-300 text-gray-900"
          : "text-white bg-red-700 hover:bg-red-600",
      )}
    >
      準備OK
    </Button>
  );
};

export default Ready;
