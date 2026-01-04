import z from "zod";

export const tokenSchema = z.object({
  sub: z.string(),
  roomId: z.string(),
  role: z.union([z.literal("host"), z.literal("guest")]),
});

export const JWT_SECRET = z.string().min(1).parse(process.env.JWT_SECRET);
export const CLIENT_ORIGIN = z.string().min(1).parse(process.env.CLIENT_ORIGIN);
export const PORT = z.coerce.number().default(3000).parse(process.env.PORT);
