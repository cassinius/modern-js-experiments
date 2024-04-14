// client.ts
import { hc } from "hono/client";
import type { App } from "./server";

const client = hc<App>("http://localhost:8787");
const ws = client.ws.$ws(0);

ws.addEventListener("open", () => {
  setInterval(() => {
    ws.send(new Date().toString());
  }, 1000);
});

ws.onmessage = (event) => {
  console.log(event.data);
};
