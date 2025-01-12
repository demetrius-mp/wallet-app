<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	import MetaTags from '$lib/components/meta-tags.svelte';
	import * as PageHeading from '$lib/components/page-heading';
	import FormError from '$lib/shadcn/custom/form-error.svelte';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import * as Form from '$lib/shadcn/ui/form';
	import Input from '$lib/shadcn/ui/input/input.svelte';

	let { data } = $props();

	const form = superForm(data.form);

	const { form: formData, enhance, submitting } = form;
</script>

<MetaTags title="Entrar" />

<PageHeading.Root>
	<PageHeading.Title>Entrar</PageHeading.Title>

	<PageHeading.Description>
		Quer criar uma conta? <a href="/auth/sign-up" class="underline">Clique aqui</a>.
	</PageHeading.Description>
</PageHeading.Root>

<FormError {form} />

<form method="POST" use:enhance class="mt-4 flex flex-col gap-2">
	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input {...props} type="text" autocomplete="email" bind:value={$formData.email} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Senha</Form.Label>

				<Input
					{...props}
					type="password"
					autocomplete="new-password"
					bind:value={$formData.password}
				/>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<div class="flex justify-end">
		<Button disabled={$submitting} type="submit">Entrar</Button>
	</div>
</form>
