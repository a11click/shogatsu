import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import JoinPage, {
  loader as joinLoader,
  action as joinAction,
} from "./routes/join.tsx";
import PlayPage, { loader as playLoader } from "./routes/play.tsx";
import NewRoomPage, { action as newRoomAction } from "./routes/new.tsx";

const router = createBrowserRouter([
  { path: "/", element: <NewRoomPage />, action: newRoomAction },
  {
    path: "/join/:roomId",
    element: <JoinPage />,
    loader: joinLoader,
    action: joinAction,
  },
  { path: "/play", element: <PlayPage />, loader: playLoader },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
