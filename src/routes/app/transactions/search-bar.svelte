<script lang="ts">
	import SearchIcon from 'lucide-svelte/icons/search';
	import XIcon from 'lucide-svelte/icons/x';

	import Button from '$lib/shadcn/ui/button/button.svelte';
	import Input from '$lib/shadcn/ui/input/input.svelte';

	type Props = {
		term: string;
	};

	let { term = $bindable() }: Props = $props();

	let searchInputValue = $state(term);
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		term = searchInputValue;
	}}
	class="flex gap-2"
>
	<div class="relative w-full">
		<Input
			name="term"
			bind:value={searchInputValue}
			class="pr-8"
			type="text"
			placeholder="Pesquise por nome"
		/>

		{#if searchInputValue}
			<Button
				type="button"
				variant="ghost"
				size="icon"
				class="group absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
				onclick={() => {
					term = '';
					searchInputValue = '';
				}}
				aria-label="Limpar pesquisa"
			>
				<XIcon class="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
			</Button>
		{/if}
	</div>

	<Button type="submit">
		<SearchIcon />
		<span class="hidden sm:inline"> Buscar </span>
	</Button>
</form>
