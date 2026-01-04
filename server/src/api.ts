import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { jwt, sign } from "hono/jwt";
import { CLIENT_ORIGIN, JWT_SECRET, tokenSchema } from "./schema.js";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";

export const app = new Hono()
  .use(csrf({ origin: CLIENT_ORIGIN }))
  .use(secureHeaders())

  .get(
    "/api/auth/role",
    jwt({ secret: JWT_SECRET, cookie: "room_id" }),
    async (c) => {
      const parsed = tokenSchema.safeParse(c.get("jwtPayload"));
      if (!parsed.success) {
        throw new HTTPException(400);
      }

      return c.json({ role: parsed.data.role });
    },
  )

  .delete(
    "/api/auth/role",
    jwt({ secret: JWT_SECRET, cookie: "room_id" }),
    async (c) => {
      deleteCookie(c, "room_id");

      return c.body(null, 204);
    },
  )

  .post("/api/rooms", async (c) => {
    const roomId = crypto.randomUUID();

    const token = await sign(
      {
        sub: roomId,
        roomId,
        role: "host",
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      JWT_SECRET,
    );
    setCookie(c, "room_id", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 60,
    });

    return c.body(null, 201);
  })

  .post("/api/rooms/:roomId/guest", async (c) => {
    const roomId = c.req.param("roomId");
    const userId = crypto.randomUUID();

    const token = await sign(
      {
        sub: userId,
        roomId,
        role: "guest",
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      JWT_SECRET,
    );
    setCookie(c, "room_id", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 60,
    });

    return c.body(null, 201);
  });

export type AppType = typeof app;
