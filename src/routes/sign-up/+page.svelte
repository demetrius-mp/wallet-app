<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	import MetaTags from '$lib/components/meta-tags.svelte';
	import PageHeading from '$lib/components/page-heading.svelte';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import * as Form from '$lib/shadcn/ui/form';
	import Input from '$lib/shadcn/ui/input/input.svelte';

	let { data } = $props();

	const form = superForm(data.form);

	const { form: formData, enhance, submitting } = form;
</script>

<MetaTags title="Cadastro" />

<PageHeading title="Cadastro" description="Cadastre-se na plataforma" />

<form method="POST" use:enhance class="flex flex-col gap-2">
	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input {...props} type="text" autocomplete="email" bind:value={$formData.email} />
			{/snippet}
		</Form.Control>

		<Form.Description>Utilize seu melhor email.</Form.Description>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Nome</Form.Label>
				<Input {...props} type="text" autocomplete="name" bind:value={$formData.name} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />

		<Form.Description>É como iremos nos referir a você.</Form.Description>
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

	<Form.Field {form} name="confirmPassword">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Confirmar senha</Form.Label>

				<Input
					{...props}
					type="password"
					autocomplete="new-password"
					bind:value={$formData.confirmPassword}
				/>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<div class="flex justify-end">
		<Button disabled={$submitting} type="submit">Cadastrar</Button>
	</div>
</form>
