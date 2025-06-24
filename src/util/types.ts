export type Event = {
	id: string,
	name: string
	information: any
}

export type User = {
	id: string,
	name: string,
}

export type FormResult = {
	name: string,
	dinner: boolean,
	overnight: boolean,
	shopping: boolean
}

export type Registration<T> = {
	id?: string,
	user_id: string,
	event_id: string,
	registration: {
		self: T,
		others: T[]
	}
}
