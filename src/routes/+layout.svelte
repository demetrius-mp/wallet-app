<script lang="ts">
	import '../app.css';

	import { Toaster } from '$lib/shadcn/ui/sonner/index.js';

	let { children } = $props();
</script>

<Toaster />

{@render children()}
