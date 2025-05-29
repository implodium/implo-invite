import PocketBase from 'pocketbase'
import { inject } from 'vue';

export function usePocketBase(): PocketBase {
	const pb: PocketBase | undefined = inject('pb')

	if (pb === undefined) {
		throw new Error('PocketBase not found')
	}

	return pb
}
