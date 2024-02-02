export type ClientWSMessage = {
  clientId: string,
  cmd?: string,
  channel?: string;
  msg?: string
};

const server = Bun.serve<{ clientId: string }>({
  fetch(req, server) {
    // TODO: handle HTTP request headers, cookies, etc. *before* upgrading to WebSocket
    {

    }
    const up = server.upgrade(req, {
      headers: {
        "Set-Cookie": `SessionId=${'blahoo'}`,
      },
      // NOTE: data is per-socket contextual data set by the *SERVER* (not the client)
      // NOTE: the client is only passing message data (as an argument to 'send')...
      data: {
        clientId: 'Bernie'
      }
    });
    if (up) {
      // NOTE: Bun automatically returns a 101 Switching Protocols response
      return undefined;
    }

    return new Response("Hello, HTTP world!");
  },
  websocket: {
    open(ws) {
      console.log({ data: ws.data });
      console.log('created WS connection for client', ws.data?.clientId);
      ws.send(`Welcome to the chat, ${ws.data?.clientId} ;-)`);
      // TODO: here we could also do subscriptions ?!
      // ws.subscribe('chat-room-XYZ');
    },
    message(ws, message) {
      console.log({ data: ws.data });
      console.log('received message', message);
      ws.send('echo: ' + message);
    },
    close(ws, code, reason) {
      console.log({ data: ws.data });
      console.log('closed WS connection', ws.data?.clientId, code, reason);
      ws.send(`Goodbye, ${ws.data?.clientId}`);
    }
  }
});

console.log(`Listening on ${server.url.toString().slice(0, -1)}`);
