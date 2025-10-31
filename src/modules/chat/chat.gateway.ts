import { Server, Socket } from "socket.io";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../models/user.model";
import { verifyToken } from "../../services/token/verifyToken";

export interface IAuthenticatedSocket extends Socket {
  user?: HydratedDocument<IUser>;
}

export const initializeSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const connectedSockets = new Map<string, string[]>();

  io.use(async (socket: IAuthenticatedSocket, next) => {
    try {
      const authorization = socket.handshake.auth?.authorization;

      if (!authorization) {
        return next(new Error("Unauthorized: Missing token"));
      }

      const data = await verifyToken({ authorization });
      socket.user = data.user;
      next();
    } catch (error) {
      next(new Error("Unauthorized: Invalid token"));
    }
  });

  io.on("connection", (socket: IAuthenticatedSocket) => {
    if (!socket.user?._id) return;

    io.emit("sayHi", "Hello From Backend");

    const userId = socket.user._id.toString();
    const currentSockets = connectedSockets.get(userId) || [];

    currentSockets.push(socket.id);
    connectedSockets.set(userId, currentSockets);

    console.log(
      `User ${socket.user?.firstName} ${socket.user?.lastName}  connected (${currentSockets.length} sockets)`
    );

    socket.on("disconnect", () => {
      const current = connectedSockets.get(userId) || [];
      const updated = current.filter((id) => id !== socket.id);

      if (updated.length === 0) connectedSockets.delete(userId);
      else connectedSockets.set(userId, updated);

      console.log(`User ${socket.user?.firstName} disconnected`);
    });
  });

  return io;
};
