import { ChatSocketServices } from "./chat.socket.service";
import { IAuthenticatedSocket } from "../../services/gateway";

export class ChatEvents {
  private chatSocketServices = new ChatSocketServices();

  constructor() {}

  registerEvents = (socket: IAuthenticatedSocket) => {
    socket.on("sendMessage", (data) =>
      this.chatSocketServices.sendMessage(socket, data)
    );

    socket.on("typing", (receiverId: string) => {
      socket.to(receiverId).emit("typing", { from: socket.user?._id });
    });

    socket.on("sendGroupMessage", (data) =>
      this.chatSocketServices.sendGroupMessage(socket, data)
    );

    socket.on("joinGroup", (data) =>
      this.chatSocketServices.joinGroupRoom(socket, data)
    );
  };
}
