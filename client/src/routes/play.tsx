import { useEffect, useState } from "react";
import { parseResponse } from "hono/client";
import type { Room } from "server/src/room";
import { client } from "../hc";
import { useLoaderData } from "react-router";
import { socket } from "../socket";
import { GameScreen } from "../components/play/play";
import Main from "../components/main";

export const loader = async () => {
  const res = await parseResponse(client.api.auth.role.$get());

  return res;
};

export default function App() {
  const { role } = useLoaderData<typeof loader>();
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    const onConnect = () => {};
    const onRoom = (r: Room) => {
      setRoom(r);
    };
    const onDisconnect = () => {
      alert("切断されました");
      window.location.href = "/";
    };

    socket.on("connect", onConnect);
    socket.on("room", onRoom);
    socket.on("disconnect", onDisconnect);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("room", onRoom);
      socket.off("disconnect", onDisconnect);

      socket.disconnect();
    };
  }, []);

  if (!room) {
    return <div>読み込み中</div>;
  }

  return role ? (
    <Main>
      <GameScreen room={room} role={role} />{" "}
    </Main>
  ) : (
    <p>エラー</p>
  );
}
