<script lang="ts">
	import '../app.css';

	import WalletIcon from 'lucide-svelte/icons/wallet';
	import { toast } from 'svelte-sonner';

	import Container from '$lib/components/container.svelte';
	import Button from '$lib/shadcn/ui/button/button.svelte';
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

<header class="border-b">
	<Container class="my-0">
		<nav class="flex h-16 items-center justify-between">
			<Button
				href="/"
				variant="ghost"
				size="lg"
				class="px-0 text-xl font-semibold hover:bg-transparent"
			>
				<WalletIcon class="!size-6" />
				e-wallet
			</Button>
			<div class="flex items-center space-x-4">
				<!-- <ModeToggle /> -->
				<Button variant="outline" href="/app/transactions">Entrar</Button>
			</div>
		</nav>
	</Container>
</header>

<Container>
	{@render children()}
</Container>
