import type { ServerWebSocket } from "bun";

export type Cmd = "publish" | "subscribe" | "unsubscribe";
export type Room = "room-a" | "room-b" | "all";

export type ClientWSMessage = {
  cmd?: Cmd;
  room?: Room;
  msgTxt?: string;
};

export type ResultType = "sub" | "unsub";
export type ResultOutcome = "success" | "failure";
export type ServerWSMessage = {
  type: ResultType,
  room: Room,
  outcome: ResultOutcome
}

type ServerWSData = { clientId: string };

const roomA = new Set<ServerWebSocket<ServerWSData>>();
const roomB = new Set<ServerWebSocket<ServerWSData>>();

const server = Bun.serve<ServerWSData>({
  fetch(req, server) {
    // TODO: handle HTTP request headers, cookies, etc. *before* upgrading to WebSocket
    {
    }

    const clientId = Math.random().toString(36).slice(2)
    const up = server.upgrade(req, {
      headers: {
        "Set-Cookie": `ClientId=${clientId}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=31536000;`,
      },
      // NOTE: data is per-socket contextual data set by the *SERVER* (not the client)
      // NOTE: the client is only passing message data (as an argument to 'send')...
      data: {
        clientId,
      },
    });
    if (up) {
      // NOTE: Bun automatically returns a 101 Switching Protocols response
      return undefined;
    }

    return new Response("Hello, HTTP world!");
  },
  websocket: {
    open(ws) {
      console.log(`clientId: ${ws.data?.clientId}`);
      console.log("created WS connection for client", ws.data?.clientId);
      ws.send(`Welcome to the chat, ${ws.data?.clientId} ;-)`);
      // TODO: here we could also do subscriptions ?!
      // ws.subscribe('chat-room-XYZ');
    },
    message(ws, message) {
      console.log(`clientId: ${ws.data?.clientId}`);
      console.log("received message", message);

      const msgStruct: ClientWSMessage = JSON.parse(message.toString());
      console.log({ msgStruct });

      switch (msgStruct.cmd) {
        case "publish":
          const channel = msgStruct.room || "all";
          const room = channel === "room-a" ? roomA : channel === "room-b" ? roomB : [...roomA, ...roomB];
          for (const client of room) {
            client.send("echo: " + message);
            // client.send(JSON.stringify({ data: msgStruct }));
          }
          break;
        case "subscribe":
          let roomSock = msgStruct.room === "room-a" ? roomA : roomB;
          roomSock.add(ws);
          
          const response: ServerWSMessage = {
            type: 'sub',
            room: msgStruct.room!,
            outcome: 'success'
          };
          ws.send(JSON.stringify(response));
          console.log(`[${ws.data?.clientId}] subscribed to ${msgStruct.room}`);

          break;
        case "unsubscribe":
          if (roomA.has(ws)) {
            roomA.delete(ws);
          } else {
            roomB.delete(ws);
          }
          break;
        default:
          throw new Error(`Unknown command: ${msgStruct.cmd}`);
      }
    },
    close(ws, code, reason) {
      console.log(`clientId: ${ws.data?.clientId}`);
      console.log("closed WS connection", ws.data?.clientId, code, reason);
      ws.send(`Goodbye, ${ws.data?.clientId}`);
    },
  },
});

console.log(`Listening on ${server.url.toString().slice(0, -1)}`);
