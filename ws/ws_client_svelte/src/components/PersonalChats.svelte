<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type {
		ClientWSMessage,
		Cmd,
		Room,
		ServerWSMessage
	} from '../../../bun/01_chatAB/server.js';

	type PersonChatProps = {
		name: string;
	};
	let { name } = $props<PersonChatProps>();

	let conn: WebSocket;

	const msgsA = $state<ClientWSMessage[]>([]);
	const msgsB = $state<ClientWSMessage[]>([]);

	let msg = $state<string>('');

	let subA = $state<boolean>(false);
	let subB = $state<boolean>(false);

	// NOTE: forgive the hack...
	const textColor = 'text-gray-800';// name === 'Alice' ? 'text-gray-700' : 'text-blue-500';
	const bgColor = name === 'Alice' ? 'bg-yellow-100' : 'bg-blue-300';

	function sendMsg(cmd: Cmd, room: Room) {
		conn.send(JSON.stringify({ cmd, room }));
	}

	onMount(() => {
		conn = new WebSocket('ws://localhost:3000');

		conn.onopen = () => {
			console.log(`[${name}] connection established`);
		};

		conn.onclose = () => {
			console.log(`[${name}] closed`);
		};

		conn.onmessage = (msg) => {
			try {
				const { type, room, outcome } = JSON.parse(msg.data) as ServerWSMessage;
				console.log({ type, outcome, room });

				switch (type) {
					case 'sub':
						if (outcome === 'success') {
							if (room === 'room-a') {
								subA = true;
							} else {
								subB = true;
							}
						}
						break;
					case 'unsub':
						if (outcome === 'success') {
							if (room === 'room-a') {
								subA = false;
							} else {
								subB = false;
							}
						}
						break;
					default:
						return false;
				}
			} catch (e) {}
		};

		conn.onerror = (err) => {
			console.error(`[${name}] error:`, err);
		};
	});

	onDestroy(() => {
		conn.close();
	});
</script>

<section class={`personal-chats w-full h-full text-center ${bgColor} ${textColor}`}>
	<h4 class="text-lg">{name} Chats</h4>

	<section class="unsub-controls">
		{#if subA}
			<button class="btn btn-error" on:click={() => sendMsg('unsubscribe', 'room-a')}
				>Unsub A</button
			>
		{:else}
			<button class="btn btn-success" on:click={() => sendMsg('subscribe', 'room-a')}>SubA</button>
		{/if}
		{#if subB}
			<button class="btn btn-error" on:click={() => sendMsg('unsubscribe', 'room-b')}
				>Unsub B</button
			>
		{:else}
			<button class="btn btn-success" on:click={() => sendMsg('subscribe', 'room-b')}>Sub B</button>
		{/if}
	</section>

	<section class="messages mt-2 flex flex-row bg-slate-100">
		<h3 class="text-lg p-1">Messages</h3>

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
