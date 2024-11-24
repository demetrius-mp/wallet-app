<script lang="ts">
	import '../app.css';

	import { toast } from 'svelte-sonner';

	import { Toaster } from '$lib/shadcn/ui/sonner/index.js';
	import { toasterIsMounted } from '$lib/shadcn/ui/sonner/sonner.svelte';
	import { clearFlashMessage } from '$lib/utils/flash-message';

	let { children, data } = $props();

	$effect(() => {
		if ($toasterIsMounted && data.flashMessage) {
			const toastData = data.flashMessage;

			toast[toastData.type](toastData.message, toastData.options);
			clearFlashMessage();
		}
	});
</script>

<Toaster />

{@render children()}
