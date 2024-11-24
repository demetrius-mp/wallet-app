<script lang="ts" module>
	import { derived, writable } from 'svelte/store';

	const toasterIsMountedStore = writable(false);

	export const toasterIsMounted = derived(
		toasterIsMountedStore,
		($toasterIsMounted) => $toasterIsMounted
	);
</script>

<script lang="ts">
	import { mode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';

	let restProps: SonnerProps = $props();

	onMount(() => {
		$toasterIsMountedStore = true;

		return () => ($toasterIsMountedStore = false);
	});
</script>

<Sonner
	theme={$mode}
	class="toaster group"
	toastOptions={{
		classes: {
			toast:
				'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
			description: 'group-[.toast]:text-muted-foreground',
			actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
			cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
		}
	}}
	{...restProps}
/>
