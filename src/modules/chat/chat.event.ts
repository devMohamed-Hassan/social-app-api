import { ChatSocketServices } from "./chat.socket.service";
import { IAuthenticatedSocket } from "../../services/gateway";

export class ChatEvents {
  private chatSocketServices = new ChatSocketServices();
  constructor() {}

  sayHi = (socket: IAuthenticatedSocket) => {
    socket.on("sayHi", (message: string, cb: Function) => {
      return this.chatSocketServices.sayHi(message, cb);
    });
  };
}
