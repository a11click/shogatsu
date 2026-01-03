import { hc } from "hono/client";
import type { AppType } from "server/src/api";

export const client = hc<AppType>(import.meta.env.VITE_API_URL, {
  init: { credentials: "include" },
});
