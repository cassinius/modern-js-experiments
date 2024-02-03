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

<section style="padding-top: 50px;">
	<button on:click={draw}> Let's draw </button>
	<button on:click={reset}> Let's restart </button>
</section>

<section>
	<h2 style="text-align: center">
		{dice == 0 ? "Let's start rolling" : dice}
	</h2>

	{#each rolls as t, index}
		<p style="text-align: center">
			Rolling number {index + 1}, the dice says {t}
		</p>
	{/each}
</section>
