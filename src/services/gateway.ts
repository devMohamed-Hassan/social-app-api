import { Server, Socket } from "socket.io";
import { HydratedDocument } from "mongoose";
import { IUser } from "../models/user.model";
import { verifyToken } from "./token/verifyToken";
import { ChatGateway } from "../modules/chat/chat.gateway";

export interface IAuthenticatedSocket extends Socket {
  user?: HydratedDocument<IUser>;
}

const connectedSockets = new Map<string, string[]>();

const addSocket = (userId: string, socketId: string) => {
  const sockets = connectedSockets.get(userId) || [];
  sockets.push(socketId);
  connectedSockets.set(userId, sockets);
};

const removeSocket = (userId: string, socketId: string) => {
  const sockets = connectedSockets.get(userId) || [];
  const updated = sockets.filter((id) => id !== socketId);
  if (updated.length === 0) connectedSockets.delete(userId);
  else connectedSockets.set(userId, updated);
};

export const disconnet = (socket: IAuthenticatedSocket) => {
  socket.on("disconnect", () => {
    if (!socket.user?._id) return;
    const userId = socket.user._id.toString();
    removeSocket(userId, socket.id);
    console.log(`User ${socket.user?.firstName} disconnected`);
  });
};

const handleChatEvents = (io: Server, socket: IAuthenticatedSocket) => {
  socket.on("message", (data) => {
    console.log(`Message from ${socket.user?.firstName}:`, data);
  });

  socket.on("typing", (receiverId) => {
    socket.to(receiverId).emit("typing", { from: socket.user?._id });
  });
};

export const initializeSocket = (httpServer: any) => {
  const chatGateway = new ChatGateway();

  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.use(async (socket: IAuthenticatedSocket, next) => {
    try {
      const authorization = socket.handshake.auth?.authorization;
      if (!authorization) return next(new Error("Unauthorized: Missing token"));
      const data = await verifyToken({ authorization });
      socket.user = data.user;
      next();
    } catch {
      next(new Error("Unauthorized: Invalid token"));
    }
  });

  io.on("connection", (socket: IAuthenticatedSocket) => {
    if (!socket.user?._id) return;
    socket.emit("connected", { message: "Socket connection established" });

    chatGateway.register(socket);

    const userId = socket.user._id.toString();
    addSocket(userId, socket.id);

    console.log(`${socket.user?.firstName} ${socket.user?.lastName} connected`);

    handleChatEvents(io, socket);
    disconnet(socket);
  });

  return io;
};
