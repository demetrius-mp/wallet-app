<script lang="ts">
	import {
		type FormOptions,
		type Infer,
		superForm,
		type SuperValidated
	} from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	import TagsField from '$lib/components/form-fields/tags-field.svelte';
	import { UpdateTransactionSchema } from '$lib/schemas';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import * as Form from '$lib/shadcn/ui/form';
	import Input from '$lib/shadcn/ui/input/input.svelte';
	import * as RadioGroup from '$lib/shadcn/ui/radio-group';

	type Props = {
		form: SuperValidated<Infer<typeof UpdateTransactionSchema>>;
		formProps?: FormOptions<Infer<typeof UpdateTransactionSchema>>;
		action: string;
	};

	let { form: data, formProps, action }: Props = $props();

	const form = superForm(data, {
		dataType: 'json',
		validators: zod(UpdateTransactionSchema),
		validationMethod: 'onsubmit',
		...formProps
	});

	const { form: formData, enhance, submitting } = form;
</script>

<form method="POST" {action} use:enhance class="mt-4 flex flex-col gap-2">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Nome</Form.Label>
				<Input {...props} type="text" autocomplete="off" bind:value={$formData.name} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="value">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Valor</Form.Label>
				<Input {...props} type="number" bind:value={$formData.value} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="tags">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Tags</Form.Label>

				<TagsField bind:value={$formData.tags} {...props} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Fieldset {form} name="category" class="mt-1 space-y-3">
		<Form.Legend>Tipo da transação</Form.Legend>
		<RadioGroup.Root bind:value={$formData.category} class="flex space-x-4" name="category">
			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control>
					{#snippet children({ props })}
						<RadioGroup.Item value="EXPENSE" {...props} />
						<Form.Label class="font-normal">Saída</Form.Label>
					{/snippet}
				</Form.Control>
			</div>

			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control>
					{#snippet children({ props })}
						<RadioGroup.Item value="INCOME" {...props} />
						<Form.Label class="font-normal">Entrada</Form.Label>
					{/snippet}
				</Form.Control>
			</div>
		</RadioGroup.Root>
		<Form.FieldErrors />
	</Form.Fieldset>

	<div class="flex justify-end">
		<Button disabled={$submitting} type="submit">Salvar</Button>
	</div>
</form>
