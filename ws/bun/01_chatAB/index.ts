const server = Bun.serve<{ clientId: string }>({
  fetch(req, server) {
    const up = server.upgrade(req);
    if (up) {
      // Bun automatically returns a 101 Switching Protocols response
      return undefined;
    }

    return new Response("Hello, HTTP world!")
  },
  websocket: {
    open(ws) {
      console.log(ws);
      console.log('created WS connection for client', ws.data?.clientId ?? "Dr. No");
      ws.send(`Welcome to the chat, ${ws.data?.clientId ?? "Dr. No"} ;-)`);
    },
    message(ws, message) {
      console.log('received message', message);
      ws.send('echo: ' + message);
    },
    close(ws, code, reason) {
      console.log('closed WS connection', ws.data?.clientId ?? "Dr. No", code, reason);
      ws.send(`Goodbye, ${ws.data?.clientId ?? "Dr. No"}`);
    }
  }
});

console.log(`Listening on ${server.url.toString().slice(0, -1)}`);
