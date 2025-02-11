<script lang="ts">
	import * as PageHeading from '$lib/components/page-heading';
	import * as Card from '$lib/shadcn/ui/card';

	let { data } = $props();
</script>

<PageHeading.Root>
	<PageHeading.Title>
		Bem vind@, {data.session.user.name}
	</PageHeading.Title>
	<PageHeading.Description>Para onde você quer ir hoje?</PageHeading.Description>
</PageHeading.Root>

<div class="flex flex-col gap-4">
	<a href="/app/transactions">
		<Card.Root class="p-6">
			<Card.Header class="p-0">
				<Card.Title>Ver transações</Card.Title>

				<Card.Description>
					Veja as suas transações mais recentes, filtre por data, categoria e modo de pagamento.
				</Card.Description>
			</Card.Header>
		</Card.Root>
	</a>

	<a href="/app/reminders">
		<Card.Root class="p-6">
			<Card.Header class="p-0">
				<Card.Title>Ver lembretes</Card.Title>

				<Card.Description>Veja os lembretes de pagamento que você cadastrou.</Card.Description>
			</Card.Header>
		</Card.Root>
	</a>
</div>
