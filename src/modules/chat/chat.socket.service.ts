import { MessageModel } from "../../models/message.model";
import { ChatRepository } from "../../repositories/chat.repository";
import { UserRepository } from "../../repositories/user.repository";
import { IAuthenticatedSocket, connectedSockets } from "../../services/gateway";
import { AppError } from "../../utils/AppError";

export class ChatSocketServices {
  private userRepo = new UserRepository();
  private chatRepo = new ChatRepository();

  constructor() {}

  sendMessage = async (
    socket: IAuthenticatedSocket,
    data: { sendTo: string; content: string }
  ) => {
    try {
      const senderId = socket.user?._id as string;

      if (!data.sendTo || !data.content?.trim()) {
        throw new AppError("Receiver ID and message content are required", 400);
      }

      const receiver = await this.userRepo.findById(data.sendTo);
      if (!receiver) throw new AppError("Receiver not found", 404);

      let chat = await this.chatRepo.findPrivateConversation(
        senderId,
        receiver.id
      );
      if (!chat) {
        chat = await this.chatRepo.createPrivateConversation(
          senderId,
          receiver.id
        );
      }

      const message = await MessageModel.create({
        conversation: chat._id,
        sender: senderId,
        content: data.content,
        seenBy: [senderId],
      });

      if (!(chat as any).messages) (chat as any).messages = [];
      (chat as any).messages.push(message._id);
      chat.lastMessage = message._id;
      await chat.save();

      const populatedMessage = await message.populate(
        "sender",
        "firstName lastName profileImage _id"
      );

      socket.emit("messageSent", {
        message: populatedMessage,
        chatId: chat._id,
      });

      const receiverSockets = connectedSockets.get(receiver.id.toString());
      if (receiverSockets?.length) {
        receiverSockets.forEach((sockId) => {
          socket.to(sockId).emit("newMessage", {
            message: populatedMessage,
            chatId: chat._id,
          });
        });
      }

      console.log(
        `Message sent from ${socket.user?.firstName} to ${receiver.firstName}`
      );
    } catch (error: any) {
      console.error("Error sending message:", error.message || error);
      socket.emit("customError", {
        message: error.message || "Failed to send message",
      });
    }
  };
}
