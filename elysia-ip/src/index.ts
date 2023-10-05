import { Elysia } from "elysia";
import { ip } from "elysia-ip";

const plugin = new Elysia().use(ip()).get("/ip-from-plugin", ({ ip }) => ip);

const app = new Elysia()
  .use(ip())
  .get("/ip", ({ ip }) => ip)
  .use(plugin)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
