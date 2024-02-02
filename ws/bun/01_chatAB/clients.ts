import type { ClientWSMessage } from "./server";

const wsA = new WebSocket("ws://localhost:3000");
const wsB = new WebSocket("ws://localhost:3000");

const names = ["Alice", "Bob"];

[wsA, wsB].forEach((ws, idx) => {
  const name = names[idx];

  ws.onopen = () => {
    console.log(`[${name}] connection established`);
    ws.send(`[${name}] Hello, world!`);
  };

  ws.onclose = () => {
    console.log(`[${name}] closed`);
  };

  ws.onmessage = (event) => {
    console.log(`[${name}] received: ${event.data}`);
  };
});

async function main() {
  [wsA, wsB].forEach((ws, idx) => {
    const name = names[idx];

    let msgIdx = 0;
    setInterval(() => {
      const msgData: ClientWSMessage = {
        clientId: name,
        cmd: "chat",
        msg: `[${name}] sending msg [${msgIdx++}]`,
      };
      ws.send(JSON.stringify({ data: msgData }));
    }, 1000);
  });
}

main();
