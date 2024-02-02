import type { ClientWSMessage } from "./server";

const wsA = new WebSocket('ws://localhost:3000');

wsA.onopen = () => {
  console.log('wsA opened');
  wsA.send('Hello, world!');
}

wsA.onclose = () => {
  console.log('wsA closed');
}

wsA.onmessage = (event) => {
  console.log('wsA received:', event.data);
}

async function main() {
  let idx = 0;
  setInterval(() => {
    const msgData: ClientWSMessage = {
      clientId: 'Bernie',
      cmd: 'chat',
      msg: `[${idx++}] Hello, B!`
    };
    wsA.send(JSON.stringify({ data: msgData }));
  }, 1000);
}

main();