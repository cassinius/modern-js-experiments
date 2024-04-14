// server.ts
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";

const { upgradeWebSocket, websocket } = createBunWebSocket();

const app = new Hono().get(
  "/ws",
  upgradeWebSocket(() => {
    return {
      onMessage: (event, ws) => {
        console.log(event.data);
        ws.send("ECHO: " + event.data);
      },
    };
  })
);

export default {
  port: 8787,
  fetch: app.fetch,
  websocket,
};

export type App = typeof app;
