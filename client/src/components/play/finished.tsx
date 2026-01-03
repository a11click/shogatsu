import type { MochitsukiResult } from "server/src/room";
import { socket } from "../../socket";
import { PrimaryButton } from "../button";

const ResultView: React.FC<{ result: MochitsukiResult }> = ({ result }) => {
  return (
    <section className="text-center space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-lg mb-2">結果</h3>
        {result.isOk ? (
          <p className="text-2xl font-mono text-green-600">
            {result.time / 1000}秒
          </p>
        ) : (
          <p className="text-xl text-red-500 font-bold">失敗...</p>
        )}
      </div>
      <PrimaryButton type="button" onClick={() => socket.emit("playAgain")}>
        もう1回
      </PrimaryButton>
    </section>
  );
};

export default ResultView;
