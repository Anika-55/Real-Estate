import { env } from "./env";

export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(JSON.stringify({ level: "info", message, data, timestamp: new Date().toISOString() }));
  },
  error: (message: string, data?: unknown) => {
    console.error(JSON.stringify({ level: "error", message, data, timestamp: new Date().toISOString() }));
  },
  debug: (message: string, data?: unknown) => {
    if (env.nodeEnv !== "production") {
      console.debug(JSON.stringify({ level: "debug", message, data, timestamp: new Date().toISOString() }));
    }
  },
};

