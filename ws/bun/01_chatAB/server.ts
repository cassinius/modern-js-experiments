import type { ServerWebSocket } from "bun";

export type Cmd = "publish" | "subscribe" | "unsubscribe";
export type Room = "room-a" | "room-b" | "all";

export type ClientWSMessage = {
  cmd?: Cmd;
  room?: Room;
  from?: string;
  msgTxt?: string;
  other?: boolean;
};

export type ResultType = "sub" | "unsub" | "msg";
export type ResultOutcome = "success" | "failure";
export type ServerWSMessage = {
  type: ResultType,
  room: Room,
  sender?: string,
  outcome?: ResultOutcome,
  msgTxt?: string,
}

type ServerWSData = { clientId: string };

const roomA = new Set<ServerWebSocket<ServerWSData>>();
const roomB = new Set<ServerWebSocket<ServerWSData>>();

// NOTE: periodically send a message to all clients.
// TODO de-duplicate WS connections from different rooms.
setInterval(() => {
  const allRooms = new Set([...roomA, ...roomB]);
  for (const client of allRooms) {
    const srvMsg: ServerWSMessage = {
      type: 'msg',
      room: 'all',
      sender: 'SYSTEM',
      msgTxt: `Keepalive, ${client.data?.clientId}!`,
    };
    client.send(JSON.stringify(srvMsg));
  }
}, 5000);

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
      // console.log(`clientId: ${ws.data?.clientId}`);
      // console.log("received message", message);

      const msgStruct: ClientWSMessage = JSON.parse(message.toString());
      // console.log({ msgStruct });

      let chatRoom: Set<ServerWebSocket<ServerWSData>>;
      let response: ServerWSMessage;

      switch (msgStruct.cmd) {
        case "publish":
          const channel = msgStruct.room || "all";
          const room =
            channel === "room-a" ? roomA :
              channel === "room-b" ? roomB :
                new Set([...roomA, ...roomB]);
          response = {
            type: 'msg',
            room: channel,
            sender: msgStruct.from,
            msgTxt: msgStruct.msgTxt!,
            outcome: 'success'
          };

          for (const client of room) {
            if (msgStruct.other && client.data?.clientId === ws.data?.clientId) {
              continue;
            }
            client.send(JSON.stringify(response));
          }

          break;
        case "subscribe":
          chatRoom = msgStruct.room === "room-a" ? roomA : roomB;
          chatRoom.add(ws);

          response = {
            type: 'sub',
            room: msgStruct.room!,
            outcome: 'success'
          };
          ws.send(JSON.stringify(response));

          console.log(`[${ws.data?.clientId}] subscribed to ${msgStruct.room}`);
          console.log(`Chat-${msgStruct.room} has ${chatRoom.size} members`);

          break;
        case "unsubscribe":
          chatRoom = msgStruct.room === "room-a" ? roomA : roomB;

          if (chatRoom.has(ws)) {
            chatRoom.delete(ws);
            const response: ServerWSMessage = {
              type: 'unsub',
              room: msgStruct.room!,
              outcome: 'success'
            };
            ws.send(JSON.stringify(response));

            console.log(`[${ws.data?.clientId}] unsubscribed from ${msgStruct.room}`);
            console.log(`Chat-${msgStruct.room} has ${chatRoom.size} members`);
          }

          break;
        default:
          throw new Error(`Unknown command: ${msgStruct.cmd}`);
      }
    },
    close(ws, code, reason) {
      console.log(`clientId: ${ws.data?.clientId}`);
      console.log("closed WS connection", ws.data?.clientId, code, reason);
      for (const room of [roomA, roomB]) {
        if (room.has(ws)) {
          room.delete(ws);
        }
      }
      ws.send(`Goodbye, ${ws.data?.clientId}`);
    },
  },
});

console.log(`Listening on ${server.url.toString().slice(0, -1)}`);
