import type { User, Session } from "../lib/auth.js";
import type { Logger } from "pino";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
      log: Logger;
      requestId: string;
    }
  }
}
