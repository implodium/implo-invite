import type { z } from "astro/zod"
import type { RegistrationOptionsSchema } from "../../../../utils/shared_types"
import { createSignal } from "solid-js"

type Filter = {
	shopping: boolean,
	lunch: boolean,
	dinner: boolean,
	overnight: boolean,
}

type ParticipantListProps = {
	participants: {
		name: string,
		extra: z.infer<typeof RegistrationOptionsSchema>
	}[]
}


export function ParticipantList(props: ParticipantListProps) {
	const [filter, setFilter] = createSignal<Filter>({
		shopping: false,
		lunch: true,
		dinner: false,
		overnight: false,
	})

	function filterRecord(participant: {dinner: boolean, overnight: boolean, shopping: boolean, lunch: boolean, name: string}) {
		return filterField(participant.dinner, filter().dinner)
			&& filterField(participant.overnight, filter().overnight)
			&& filterField(participant.shopping, filter().shopping)
			&& filterField(participant.lunch, filter().lunch)
	}

	function filterField(value: boolean, filter: boolean): boolean {
		if (filter === false) {
			return true
		}

		return value
	}

	return <>
		<div>
			<input type="checkbox" checked={filter().shopping} onChange={(e) => {
				setFilter({
					...filter(),
					shopping: e.target.checked,
				})
			}} />
			<label>Shopping</label>
			<input type="checkbox" checked={filter().lunch} onChange={(e) => {
				setFilter({
					...filter(),
					lunch: e.target.checked,
				})
			}} />
			<label>Lunch</label>
			<input type="checkbox" checked={filter().dinner} onChange={(e) => {
				setFilter({
					...filter(),
					dinner: e.target.checked,
				})
			}} />
			<label>Dinner</label>
			<input type="checkbox" checked={filter().overnight} onChange={(e) => {
				setFilter({
					...filter(),
					overnight: e.target.checked,
				})
			}} />
			<label>Overnight</label>
		</div>
		{
			props.participants
				.flatMap(participant => [{...participant.extra, name: participant.name}, ...participant.extra.otherPeople])
				.filter(participant => {
					return filterRecord({
						name: participant.name,
						dinner: participant.dinner,
						overnight: participant.overnight,
						shopping: participant.shopping,
						lunch: participant.lunch,
					})
				})
				.map((participant) => (
					<li>{participant.name}</li>
				))
		}
	</>

}
