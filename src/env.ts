import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().min(1),
  DOMAIN: z.string().min(1),
  DATABASE_URL: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid or missing environment variables:");
  console.error(
    parsedEnv.error.errors.forEach((e) =>
      e.path.forEach((p) => console.error(p))
    )
  );
  process.exit(1);
}

export const env = parsedEnv.data;

type Env = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
