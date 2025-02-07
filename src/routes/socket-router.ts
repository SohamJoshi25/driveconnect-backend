import { Server, DefaultEventsMap, Socket, DisconnectReason } from "socket.io";
import { OnFileChunk, OnFileUploadEnd, OnFileUploadStart } from "../controllers/socket-controller.js";

export const connectIO = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  io.on("connection", (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    (() => {
      console.log("Client Connected ", socket.id);
    })();

    socket.on("file_upload_start", OnFileUploadStart);
    socket.on("file_chunk", OnFileChunk);
    socket.on("file_upload_end", OnFileUploadEnd);

    socket.on("disconnect", (disconnectReason: DisconnectReason) => {
      console.log(`Client Disconnected ${socket.id}\nReason : ${disconnectReason}`);
    });
  });
};
