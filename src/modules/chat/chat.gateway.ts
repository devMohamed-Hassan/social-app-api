import { IAuthenticatedSocket } from "../../services/gateway";
import { ChatEvents } from "./chat.event";

export class ChatGateway {
  private chatEvents = new ChatEvents();

  constructor() {}

  initializeSocketEvents = (socket: IAuthenticatedSocket) => {
    this.chatEvents.registerEvents(socket);
  };
}
