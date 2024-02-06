<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type {
		ClientWSMessage,
		Cmd,
		Room,
		ServerWSMessage
	} from './../../../bun/01_chatAB/server.ts';

	let wsA: WebSocket;
	let wsB: WebSocket;

	let msgsA = $state<ClientWSMessage[]>([]);
	let msgsB = $state<ClientWSMessage[]>([]);

	let msgA = '';
	let msgB = '';

	let aASub = $state<boolean>(false);
	let aBSub = $state<boolean>(false);
	let bASub = $state<boolean>(false);
	let bBSub = $state<boolean>(false);

	function sendMsg(ws: WebSocket, cmd: Cmd, room: Room) {
		ws.send(JSON.stringify({ cmd, room }));
	}

	onMount(() => {
		wsA = new WebSocket('ws://localhost:3000');
		wsB = new WebSocket('ws://localhost:3000');

		const names = ['Alice', 'Bob'];

		// TODO: how do I know which socket I am ?? => Just index for now...
		[wsA, wsB].forEach((ws, idx) => {
			const name = names[idx];

			ws.onopen = () => {
				console.log(`[${name}] connection established`);
				// ws.send(`[${name}] Hello, world!`);
			};

			ws.onclose = () => {
				console.log(`[${name}] closed`);
			};

			ws.onmessage = (msg) => {
				// console.log(`[${name}] message:`, msg);
				try {
					const { type, room, outcome } = JSON.parse(msg.data) as ServerWSMessage;
					console.log({ type, outcome, room });

					switch (type) {
						case 'sub':
							if (outcome === 'success') {
								if (room === 'room-a') {
									idx ? (bASub = true) : (aASub = true);
								} else {
									idx ? (bBSub = true) : (aBSub = true);
								}
							}
							break;
						case 'unsub':
							if (outcome === 'success') {
								if (room === 'room-a') {
									idx ? (bASub = false) : (aASub = false);
								} else {
									idx ? (bBSub = false) : (aBSub = false);
								}
							}
							break;
						default:
							return false;
					}
				} catch (e) {
					// TODO: all messages should "behave" structurally...
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

<h2 class="my-2 text-3xl text-center">Svelte chat WS experiment</h2>
<section class="main-chat">
	<section class="chat-alice">
		<h4 class="text-lg">Alice Chats</h4>
		<section class="unsub-controls">
			{#if aASub}
				<button class="btn btn-error" on:click={() => sendMsg(wsA, 'unsubscribe', 'room-a')}
					>Unsub A</button
				>
			{:else}
				<button class="btn btn-success" on:click={() => sendMsg(wsA, 'subscribe', 'room-a')}
					>SubA</button
				>
			{/if}
			{#if aBSub}
				<button class="btn btn-error" on:click={() => sendMsg(wsA, 'unsubscribe', 'room-b')}
					>Unsub B</button
				>
			{:else}
				<button class="btn btn-success" on:click={() => sendMsg(wsA, 'subscribe', 'room-b')}
					>Sub B</button
				>
			{/if}
		</section>

		<section class="messages">
			<h3 class="text-lg">Messages</h3>

			<section class="msg-list-a">
				{#each msgsA as msg (msg.msgTxt)}
					<p class="msg">{msg.msgTxt}</p>
				{/each}
			</section>

			<section class="msg-list-b">
				{#each msgsB as msg (msg.msgTxt)}
					<p class="msg">{msg.msgTxt}</p>
				{/each}
			</section>
		</section>
	</section>

	<section class="chat-bob">
		<h4 class="text-lg">Bob Chats</h4>
		<section class="unsub-controls">
			{#if bASub}
				<button class="btn btn-error" on:click={() => sendMsg(wsB, 'unsubscribe', 'room-a')}
					>Unsub A</button
				>
			{:else}
				<button class="btn btn-success" on:click={() => sendMsg(wsB, 'subscribe', 'room-a')}
					>SubA</button
				>
			{/if}
			{#if bBSub}
				<button class="btn btn-error" on:click={() => sendMsg(wsB, 'unsubscribe', 'room-b')}
					>Unsub B</button
				>
			{:else}
				<button class="btn btn-success" on:click={() => sendMsg(wsB, 'subscribe', 'room-b')}
					>Sub B</button
				>
			{/if}
		</section>

		<section class="messages">
			<h3 class="text-lg">Messages</h3>

			<section class="msg-list-a">
				{#each msgsA as msg (msg.msgTxt)}
					<p class="msg">{msg.msgTxt}</p>
				{/each}
			</section>

			<section class="msg-list-b">
				{#each msgsB as msg (msg.msgTxt)}
					<p class="msg">{msg.msgTxt}</p>
				{/each}
			</section>
		</section>
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

	.chat-alice,
	.chat-bob {
		// display: flex;
		// flex-direction: column;
		// align-items: center;
		// justify-content: center;
		width: 100vw;
		height: 100vh;
		text-align: center;

		.messages {
			display: flex;
			flex-direction: row;

			background-color: #eee;

			.msg-list-a,
			.msg-list-b {
				// display: flex;
				// flex-direction: column;
				// align-items: center;
				// justify-content: center;
			}
		}
	}

	.chat-alice {
		color: black;
		background-color: #ece49c;
	}

	.chat-bob {
		color: grey;
		background-color: #9ef5e9;
	}
</style>
