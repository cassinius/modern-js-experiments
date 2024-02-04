<script lang="ts">
	let dice = $state<number>(0);
	let rolls = $state<number[]>([]);

	function draw() {
		dice = Math.floor(Math.random() * 6) + 1;
		// NOTE: interesting to see how the state is updated *reactively*
		rolls[rolls.length] = dice;
	}

	function reset() {
		dice = 0;
		rolls = [];
	}
</script>

<h2>Main chat</h2>
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
