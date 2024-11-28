import "./env";
import app from "./app";
import http from "http";
import { PrismaClient, UserRole } from "@prisma/client";
import { initializeSocketGateway } from "./socket/socketGateway";

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


const prisma = new PrismaClient();

const httpServer = http.createServer(app).listen(3001, () => {
  console.log(`Server is running on port 3001`);
});

// const socketGateway = initializeSocketGateway(app, httpServer, prisma);

httpServer.setTimeout(60000);