<script lang="ts">
	import PersonalChats from '../components/PersonalChats.svelte';
</script>

<h2 class="h-[2.2rem] my-2 text-3xl text-center">Svelte chat WS experiment</h2>
<section class="main-chat">
	<PersonalChats name="Alice" />
	<PersonalChats name="Bob" />
</section>

<style lang="scss">
	.main-chat {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: calc(100vh - 2.2rem);
		color: white;
		background-color: red;
	}
</style>
