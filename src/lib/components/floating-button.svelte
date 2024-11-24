<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		spacerClass?: string;
	};

	let { children, spacerClass = 'mt-12' }: Props = $props();
</script>

<div class={spacerClass}></div>

<div class="floating-button-container">
	{@render children()}
</div>

<style lang="postcss">
	.floating-button-container {
		@apply fixed bottom-4;
		right: calc(1rem + var(--scrollbar-width, 0px));
	}
</style>
