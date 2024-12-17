import { UserRole } from "@prisma/client";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import "./env";
import { chatGateway } from "./socket/chat/chatGateway";
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


// const prisma = new PrismaClient();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://10.0.2.2:3001",
    methods: ["GET", "POST"]
  }
})

chatGateway(io);

httpServer.listen(3001, () => {
  console.log(`Server is running on port 3001`);
});


httpServer.setTimeout(60000);