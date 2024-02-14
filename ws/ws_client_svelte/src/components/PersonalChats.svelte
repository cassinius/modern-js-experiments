<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { ClientWSMessage, Cmd, Room, ServerWSMessage } from '../../../bun/01_chatAB/server';

	type PersonChatProps = {
		name: string;
	};
	let { name } = $props<PersonChatProps>();

	let conn: WebSocket;

	const msgsA = $state<ServerWSMessage[]>([]);
	const msgsB = $state<ServerWSMessage[]>([]);

	let newMsgTxt = $state<string>('');

	let subA = $state<boolean>(false);
	let subB = $state<boolean>(false);
	let subSys = $state<boolean>(false);

	// NOTE: forgive the hack...
	const textColor = 'text-gray-800'; // name === 'Alice' ? 'text-gray-700' : 'text-blue-500';
	const bgColor = name === 'Alice' ? 'bg-orange-200' : 'bg-blue-300';

	function sendMsg(cmd: Cmd, room: Room) {
		conn.send(JSON.stringify({ cmd, room }));
	}

	onMount(() => {
		conn = new WebSocket('ws://localhost:3000?name=' + name);

		conn.onopen = (res) => {
			console.log({ res });
			console.log(`[${name}] connection established`);
		};

		conn.onclose = () => {
			console.log(`[${name}] closed`);
		};

		conn.onmessage = (msg) => {
			try {
				const { type, room, outcome, msgTxt, sender } = JSON.parse(msg.data) as ServerWSMessage;
				// console.log({ type, outcome, room, msgTxt, sender});

				if (type === 'msg' && sender == 'SYSTEM' && !subSys) {
					return;
				}

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
					case 'msg':
						console.log({});
						if (room === 'room-a' && subA) {
							msgsA.push(JSON.parse(msg.data));
						} else if (room === 'room-b' && subB) {
							msgsB.push(JSON.parse(msg.data));
						}
						// NOTE: if we wanted to make this more secure by not doing client-side checks,
						// NOTE: we would need to open a new connection for each room...
						else if (room === 'all') {
							console.log('got message for all rooms');
							subA && msgsA.push(JSON.parse(msg.data));
							subB && msgsB.push(JSON.parse(msg.data));
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

<section class={`personal-chats flex flex-col w-full text-center ${bgColor} ${textColor}`}>
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

		{#if subSys}
			<button class="btn btn-error" on:click={() => (subSys = false)}>No Sys</button>
		{:else}
			<button class="btn btn-success" on:click={() => (subSys = true)}>Sys</button>
		{/if}
	</section>

	<section class="messages flex flex-col flex-1 mx-2 mt-2 p-1 rounded-lg bg-slate-100">
		<h3 class="text-lg p-1">Messages</h3>

		<section class="msg-area flex flex-col flex-1">
			<section class="msg-list-a flex-1 m-1 p-1 text-left bg-orange-200 text-black rounded-lg">
				<p>Room A</p>
				{#each msgsA as msg (msg.msgTxt)}
					<p class="msg">[{msg.sender}] {msg.msgTxt}</p>
				{/each}
			</section>

			<section class="msg-list-b flex-1 m-1 p-1 text-left bg-blue-200 text-black rounded-lg">
				<p>Room B</p>
				{#each msgsB as msg (msg.msgTxt)}
					<p class="msg">[{msg.sender}] {msg.msgTxt}</p>
				{/each}
			</section>
		</section>

		<section class="msg-input flex flex-row">
			<input
				class="flex-1 m-1 px-3 text-gray-300 rounded-lg"
				type="text"
				bind:value={newMsgTxt}
				placeholder="Type a message..."
			/>

			<button
				class="btn btn-primary m-1 px-2 rounded-lg"
				on:click={() => {
          const newClientMsg: ClientWSMessage = {
            msgTxt: newMsgTxt,
            from: name,
            cmd: 'publish',
            room: 'room-a'
          }
          conn.send(JSON.stringify(newClientMsg));
					newMsgTxt = '';
				}}
			>
				-> A
			</button>

			<button
				class="btn btn-primary m-1 px-2 rounded-lg"
				on:click={() => {
					const newClientMsg: ClientWSMessage = {
            msgTxt: newMsgTxt,
            from: name,
            cmd: 'publish',
            room: 'room-b'
          }
          conn.send(JSON.stringify(newClientMsg));
					newMsgTxt = '';
				}}
			>
				-> B
			</button>

			<button
				class="btn btn-primary m-1 px-2 rounded-lg"
				on:click={() => {
					const newClientMsg: ClientWSMessage = {
            msgTxt: newMsgTxt,
            from: name,
            cmd: 'publish',
            room: 'all'
          }
          conn.send(JSON.stringify(newClientMsg));
					newMsgTxt = '';
				}}
			>
				-> All
			</button>

			<button
				class="btn btn-primary m-1 px-2 rounded-lg"
				on:click={() => {
					const newClientMsg: ClientWSMessage = {
            msgTxt: newMsgTxt,
            from: name,
            cmd: 'publish',
            room: 'all',
            other: true
          }
          conn.send(JSON.stringify(newClientMsg));
					newMsgTxt = '';
				}}
			>
				-> Other
			</button>
		</section>
	</section>
</section>
