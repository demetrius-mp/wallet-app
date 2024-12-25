<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div class="mt-20"></div>

<div class="floating-button-container">
	{@render children()}
</div>

<style lang="postcss">
	.floating-button-container {
		@apply fixed bottom-4;
		right: calc(1rem + var(--scrollbar-width, 0px));
	}
</style>
