<script lang="ts">
	import PersonalChats from '../components/PersonalChats.svelte';
</script>

<section class="main h-screen max-h-screen flex flex-col">
	<h2 class="my-2 text-3xl text-center">Svelte chat WS experiment</h2>
	<section class="main-chat flex flex-row flex-1 text-white bg-red">
		<PersonalChats name="Alice" />
		<PersonalChats name="Bob" />
	</section>
</section>
