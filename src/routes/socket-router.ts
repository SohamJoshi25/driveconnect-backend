import { Server, DefaultEventsMap, Socket, DisconnectReason } from "socket.io";

export const connectIO = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  io.on("connection", (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    (() => {
      console.log("Client Connected ", socket.id);
    })();

    socket.on("disconnect", (disconnectReason: DisconnectReason) => {
      console.log(`Client Disconnected ${socket.id}\nReason : ${disconnectReason}`);
    });
  });
};
