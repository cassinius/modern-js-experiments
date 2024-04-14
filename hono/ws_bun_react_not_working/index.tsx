import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";

const { upgradeWebSocket, websocket } = createBunWebSocket();

const app = new Hono();

app.get("/", (c) => {
  return c.html(
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <div id="now-time"></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        console.log('blah');
        
        const ws = new WebSocket('ws://localhost:3000/ws')
        console.log(ws);

        const $nowTime = document.getElementById('now-time')
        ws.onmessage = (event) => {
          console.log(event.data);
          $nowTime.textContent = JSON.stringify(event.data, null, 2)
        }
        `,
          }}
        ></script>
      </body>
    </html>
  );
});

const ws = app.get(
  "/ws",
  upgradeWebSocket((c) => {
    let intervalId: Timer;
    
    return {
      onOpen(_event, ws) {
        intervalId = setInterval(() => {
          ws.send(new Date().toString());
        }, 200);
      },
      onClose() {
        clearInterval(intervalId);
      },
    };
  })
);

Bun.serve({
  fetch: app.fetch,
  websocket,
});
