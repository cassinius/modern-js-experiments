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
      console.log(`[${name}]\t received: ${msgStruct.data.msgTxt}`);
    } else {
      console.log(`[${name}]\t received RAW: ${data}`);
    }
  };

  ws.onerror = (err) => {
    console.error(`[${name}] error:`, err);
  };
});

async function main() {
  [wsA, wsB].forEach((ws, idx) => {
    const name = names[idx];

    let msgIdx = 0;

    const subscribeMsg: ClientWSMessage = {
      cmd: "subscribe",
      // NOTE: Alice subscribes to room-a, Bob to room-b
      room: idx ? "room-b" : "room-a",
    };

    console.log(`[${name}] sending subscribe msg:`, subscribeMsg);

    // NOTE: need to wait a bit before sending the subscribe message (after 'open')
    setTimeout(() => {
      ws.send(JSON.stringify({ data: subscribeMsg }));
    }, 100);

    setInterval(() => {
      const rand = Math.random();
      const channel = rand < 0.33 ? "room-a" : rand < 0.66 ? "room-b" : "all";

      const msgData: ClientWSMessage = {
        cmd: "publish",
        room: channel,
        msgTxt: `[${name}] sending msg [${msgIdx++}] to [${channel}]`,
      };
      ws.send(JSON.stringify({ data: msgData }));
    }, 1000);
  });
}

main();
