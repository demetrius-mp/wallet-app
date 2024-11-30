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

<div class="space-y-4">
	<Card.Root class="p-6">
		<a href="/app/transactions">
			<Card.Header class="p-0">
				<Card.Title>Ver transações</Card.Title>

				<Card.Description>
					Veja as suas transações mais recentes, filtre por data, categoria e modo de pagamento.
				</Card.Description>
			</Card.Header>
		</a>
	</Card.Root>

	<Card.Root class="p-6">
		<a href="/app/reminders">
			<Card.Header class="p-0">
				<Card.Title>Ver lembretes</Card.Title>

				<Card.Description>Veja os lembretes de pagamento que você cadastrou.</Card.Description>
			</Card.Header>
		</a>
	</Card.Root>
</div>
