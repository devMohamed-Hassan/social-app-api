import { Server, Socket } from "socket.io";
import { HydratedDocument } from "mongoose";
import { IUser } from "../models/user.model";
import { verifyToken } from "./token/verifyToken";
import { ChatGateway } from "../modules/chat/chat.gateway";

export interface IAuthenticatedSocket extends Socket {
  user?: HydratedDocument<IUser>;
}

export const connectedSockets = new Map<string, string[]>();

const addSocket = (userId: string, socketId: string) => {
  const sockets = connectedSockets.get(userId) || [];
  sockets.push(socketId);
  connectedSockets.set(userId, sockets);
};

const removeSocket = (userId: string, socketId: string) => {
  const sockets = connectedSockets.get(userId) || [];
  const updated = sockets.filter((id) => id !== socketId);
  updated.length
    ? connectedSockets.set(userId, updated)
    : connectedSockets.delete(userId);
};

const handleDisconnect = (socket: IAuthenticatedSocket) => {
  socket.on("disconnect", () => {
    if (!socket.user?._id) return;
    removeSocket(socket.user._id.toString(), socket.id);
    console.log(`${socket.user?.firstName} disconnected`);
  });
};

export const initializeSocket = (httpServer: any) => {
  const io = new Server(httpServer, { cors: { origin: "*" } });
  const chatGateway = new ChatGateway();

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

    const userId = socket.user._id.toString();
    addSocket(userId, socket.id);

    console.log(`${socket.user?.firstName} connected`);

    socket.emit("connected", { message: "Socket connection established" });

    chatGateway.initializeSocketEvents(socket);

    handleDisconnect(socket);
  });

  return io;
};
