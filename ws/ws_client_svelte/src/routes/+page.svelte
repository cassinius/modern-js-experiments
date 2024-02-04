<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { ClientWSMessage } from './../../../bun/01_chatAB/server.ts';

	let wsA: WebSocket;
	let wsB: WebSocket;

	let msgsA = $state<ClientWSMessage[]>([]);
	let msgsB = $state<ClientWSMessage[]>([]);

	let msgA = '';
	let msgB = '';

	onMount(() => {
		wsA = new WebSocket('ws://localhost:3000');
		wsB = new WebSocket('ws://localhost:3000');

		const names = ['Alice', 'Bob'];

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
				if (data.startsWith('echo:')) {
					const msgStrWoEcho = data.split(':').slice(1).join(':');
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
	});

	onDestroy(() => {
		wsA.close();
		wsB.close();
	});
</script>

<h2>Svelte chat WS experiment</h2>
<section class="main-chat">
	<section class="chat-a">
		<h4>Chat Room A</h4>
		<p>Messages</p>
	</section>

	<section class="chat-b">
		<h4>Chat Room B</h4>
		<p>Messages</p>
	</section>
</section>

<style lang="scss">
	.main-chat {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 100vh;
		color: white;
		background-color: red;
	}

	.chat-a,
	.chat-b {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		text-align: center;
	}

	.chat-a {
		color: black;
		background-color: #ece49c;
	}

	.chat-b {
		color: grey;
		background-color: #9ef5e9;
	}
</style>
