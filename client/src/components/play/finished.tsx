import type { MochitsukiResult } from "server/src/room";
import { socket } from "../../socket";
import { PrimaryButton } from "../button";

const ResultView: React.FC<{ result: MochitsukiResult }> = ({ result }) => {
  return (
    <section className="space-y-4 text-center">
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-lg font-bold">結果</h3>
        {result.isOk ? (
          <p className="font-mono text-2xl text-green-600">
            {result.time / 1000}秒
          </p>
        ) : (
          <p className="text-xl font-bold text-red-500">失敗...</p>
        )}
      </div>
      <PrimaryButton type="button" onClick={() => socket.emit("playAgain")}>
        もう1回
      </PrimaryButton>
    </section>
  );
};

export default ResultView;
