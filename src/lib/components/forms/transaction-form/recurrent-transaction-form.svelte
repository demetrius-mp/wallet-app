<script lang="ts">
	import { parseDate, startOfMonth, toCalendarDate } from '@internationalized/date';
	import {
		type FormOptions,
		type Infer,
		superForm,
		type SuperValidated
	} from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	import DateField from '$lib/components/form-fields/date-field.svelte';
	import MonthField from '$lib/components/form-fields/month-field.svelte';
	import TagsField from '$lib/components/form-fields/tags-field.svelte';
	import { BaseTransactionSchema, RecurrentTransactionSchema } from '$lib/schemas';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import * as Form from '$lib/shadcn/ui/form';
	import Input from '$lib/shadcn/ui/input/input.svelte';
	import * as RadioGroup from '$lib/shadcn/ui/radio-group';

	type Props = {
		form: SuperValidated<Infer<typeof RecurrentTransactionSchema>>;
		baseFormData?: z.infer<typeof BaseTransactionSchema>;
		formProps?: FormOptions<Infer<typeof RecurrentTransactionSchema>>;
		action: string;
	};

	let { form: data, formProps, action, baseFormData = $bindable() }: Props = $props();

	let touched = $state<{
		[key in keyof z.infer<typeof RecurrentTransactionSchema>]?: boolean;
	}>({});

	const form = superForm(data, {
		dataType: 'json',
		validators: zod(RecurrentTransactionSchema),
		validationMethod: 'onsubmit',
		...formProps
	});

	const { form: formData, enhance, submitting } = form;

	if (baseFormData) {
		$formData.name = baseFormData.name;
		$formData.value = baseFormData.value;
		$formData.purchasedAt = baseFormData.purchasedAt;
		$formData.firstInstallmentAt = baseFormData.firstInstallmentAt;
		$formData.tags = baseFormData.tags;
		$formData.category = baseFormData.category;
	}

	$effect(() => {
		baseFormData = $formData;
	});
</script>

<form method="POST" {action} use:enhance class="mt-4 flex flex-col gap-2">
	<input type="hidden" name="mode" value={$formData.mode} />

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

	<Form.Field {form} name="purchasedAt">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Data da compra</Form.Label>
				<DateField
					{...props}
					bind:value={$formData.purchasedAt}
					onValueChange={(v) => {
						if (!v) return;
						if (touched.firstInstallmentAt) return;

						$formData.firstInstallmentAt = toCalendarDate(v).add({ months: 1 }).toString();
					}}
				/>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="firstInstallmentAt">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Primeiro pagamento</Form.Label>
				<MonthField
					{...props}
					bind:value={$formData.firstInstallmentAt}
					minValue={startOfMonth(parseDate($formData.purchasedAt))}
					onValueChange={(date) => {
						if (!date) return;

						touched.firstInstallmentAt = true;
					}}
				/>
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
						<RadioGroup.Item value="INCOME" {...props} />
						<Form.Label class="font-normal">Entrada</Form.Label>
					{/snippet}
				</Form.Control>
			</div>

			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control>
					{#snippet children({ props })}
						<RadioGroup.Item value="EXPENSE" {...props} />
						<Form.Label class="font-normal">Saída</Form.Label>
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
