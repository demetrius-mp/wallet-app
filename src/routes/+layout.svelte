<script lang="ts">
	import '../app.css';

	import LogOutIcon from 'lucide-svelte/icons/log-out';
	import MoonIcon from 'lucide-svelte/icons/moon';
	import SunIcon from 'lucide-svelte/icons/sun';
	import SunMoonIcon from 'lucide-svelte/icons/sun-moon';
	import UserIcon from 'lucide-svelte/icons/user';
	import WalletIcon from 'lucide-svelte/icons/wallet';
	import { ModeWatcher } from 'mode-watcher';
	import { mode, setMode } from 'mode-watcher';
	import { toast } from 'svelte-sonner';

	import { enhance } from '$app/forms';
	import Container from '$lib/components/container.svelte';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/shadcn/ui/dropdown-menu';
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

<ModeWatcher />
<Toaster />

{#snippet themeSwitch()}
	<DropdownMenu.Group>
		<DropdownMenu.GroupHeading>Tema</DropdownMenu.GroupHeading>

		<DropdownMenu.Separator />
		<DropdownMenu.RadioGroup
			value={$mode}
			onValueChange={(value) => {
				setMode(value as 'light' | 'dark');
			}}
		>
			<DropdownMenu.RadioItem value="light">
				<SunIcon class="mr-2 size-4" />
				Claro
			</DropdownMenu.RadioItem>
			<DropdownMenu.RadioItem value="dark">
				<MoonIcon class="mr-2 size-4" />
				Escuro
			</DropdownMenu.RadioItem>
		</DropdownMenu.RadioGroup>
	</DropdownMenu.Group>
{/snippet}

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
				{#if data.session}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="size-10 rounded-full">
							{#snippet child({ props })}
								<Button {...props} variant="ghost" size="icon">
									<UserIcon class="!size-5" />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>

						<DropdownMenu.Content align="end">
							{@render themeSwitch()}

							<DropdownMenu.Separator />

							<DropdownMenu.Item
								class="w-full cursor-pointer text-destructive data-[highlighted]:text-destructive"
							>
								{#snippet child({ props })}
									<form method="post" action="/auth/sign-out" use:enhance>
										<button {...props} type="submit">
											<LogOutIcon class="mr-2 size-4" />

											<span>Sair</span>
										</button>
									</form>
								{/snippet}
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="size-10 rounded-full">
							{#snippet child({ props })}
								<Button {...props} variant="ghost" size="icon">
									<SunMoonIcon class="!size-5" />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>

						<DropdownMenu.Content align="end">
							{@render themeSwitch()}
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<Button variant="outline" href="/app/transactions">Entrar</Button>
				{/if}
			</div>
		</nav>
	</Container>
</header>

<Container>
	{@render children()}
</Container>
