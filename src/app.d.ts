// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		type FlashType = 'success' | 'info' | 'warning' | 'error' | 'message';
		export type FlashMessage = {
			type: FlashType;
			message: string;
			options?: import('svelte-sonner').ExternalToast;
		};
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
