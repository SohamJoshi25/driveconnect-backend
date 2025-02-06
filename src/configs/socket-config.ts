import { Server, DefaultEventsMap } from "socket.io";
import http from "http";

export const socketConnection = (server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> => {
  const io = new Server(server, {
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  return io;
};
