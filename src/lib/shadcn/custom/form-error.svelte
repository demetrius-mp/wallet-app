<script lang="ts" module>
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import CircleAlertIcon from 'lucide-svelte/icons/circle-alert';
	import type { SuperForm } from 'sveltekit-superforms';

	import * as Alert from '$lib/shadcn/ui/alert';

	type Props = {
		form: SuperForm<T>;
	};

	let { form }: Props = $props();

	let { errors } = form;

	let errorMessage = $derived($errors._errors?.at(0));
</script>

{#if errorMessage}
	<Alert.Root>
		<CircleAlertIcon class="size-4" />
		<Alert.Title>Erro</Alert.Title>

		<Alert.Description>
			{errorMessage}
		</Alert.Description>
	</Alert.Root>
{/if}
