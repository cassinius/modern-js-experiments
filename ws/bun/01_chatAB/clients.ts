import type { ClientWSMessage } from "./server";

const wsA = new WebSocket("ws://localhost:3000");
const wsB = new WebSocket("ws://localhost:3000");

const names = ["Alice", "Bob"];

[wsA, wsB].forEach((ws, idx) => {
  const name = names[idx];

  ws.onopen = () => {
    console.log(`[${name}] connection established`);
    // ws.send(`[${name}] Hello, world!`);
  };

  ws.onclose = () => {
    console.log(`[${name}] closed`);
  };

  ws.onmessage = ({ type, data }: { type: string; data: string }) => {
    // console.log({ type, data });
    if (data.startsWith("echo:")) {
      const msgStrWoEcho = data.split(":").slice(1).join(":");
      // console.log(msgStrWoEcho);
      const msgStruct: { data: ClientWSMessage } = JSON.parse(msgStrWoEcho);
      console.log(`[${name}]\t received: ${msgStruct.data.msg}`);
    } else {
      console.log(`[${name}]\t received RAW: ${data}`);
    }
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
