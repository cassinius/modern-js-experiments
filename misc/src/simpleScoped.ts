import { Elysia } from "elysia";

const someMiddleware = new Elysia({ prefix: "/mw" });

const router = new Elysia({ scoped: true })
  .use(someMiddleware)
  .get("/scoped", () => "okay-didoodle");

const app = new Elysia().use(router);

const response = await app.handle(new Request("http://localhost/scoped"));
console.log("response:", await response.text());
