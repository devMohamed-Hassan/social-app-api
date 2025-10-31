import { IAuthenticatedSocket } from "../../services/gateway";
import { ChatEvents } from "./chat.event";

export class ChatGateway {
  private chatEvents = new ChatEvents();
  constructor() {}

  register = (socket: IAuthenticatedSocket) => {
    this.chatEvents.sayHi(socket);
  };
}
