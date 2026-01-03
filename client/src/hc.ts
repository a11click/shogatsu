import { hc } from "hono/client";
import type { AppType } from "server/src/api";

export const client = hc<AppType>("/",{
  init: { credentials: "include" },
});
