import "./env";
import app from "./app";
import http from "http";
import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      emailVerified: boolean;
      role: UserRole;
    }
  }
}

const httpServer = http.createServer(app).listen(3001, () => {
  console.log(`Server is running on port 3001`);
});

httpServer.setTimeout(60000);