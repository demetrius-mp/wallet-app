<script lang="ts">
	import type { Snippet } from 'svelte';

	import PageHeadingSeparator from './page-heading-separator.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

{@render children()}

<PageHeadingSeparator />
