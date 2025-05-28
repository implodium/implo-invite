import PocketBase from 'pocketbase'
import { inject } from 'vue';

export function usePocketBase() {
	const pb: PocketBase | undefined = inject('pb')
	return pb
}
