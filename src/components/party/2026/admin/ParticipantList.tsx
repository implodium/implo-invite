import type { z } from "astro/zod"
import { createSignal } from "solid-js"
import type { ParticipantExtraSchema, PersonExtraSchema } from "../../../../utils/party/2026/type"

type Filter = {
	shopping: boolean,
	lunch: boolean,
	dinner: boolean,
	overnight: boolean,
}

type ParticipantListProps = {
	participants: {
		name: string,
		extra: z.infer<typeof ParticipantExtraSchema>
	}[]
}


export function ParticipantList(props: ParticipantListProps) {
	const [filter, setFilter] = createSignal<Filter>({
		shopping: false,
		lunch: false,
		dinner: false,
		overnight: false,
	})

	function filterRecord(participant: z.infer<typeof PersonExtraSchema>) {
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

	function flatParticipants() {
		return props.participants
			.flatMap(participant => [{ ...participant.extra, name: participant.name }, ...participant.extra.otherPeople])
			.filter(participant => {
				return filterRecord({
					name: participant.name,
					dinner: participant.dinner,
					overnight: participant.overnight,
					shopping: participant.shopping,
					lunch: participant.lunch,
				})
			})
	}

	return <>
		<div>
			Count: {flatParticipants().length}
		</div>
		<div class="filter-container">
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
			flatParticipants()
				.map((participant) => (
					<li class="participant-entry">
						{participant.name}
						<span classList={{ active: participant.shopping }}>Shopping</span>
						<span classList={{ active: participant.lunch }}>Lunch</span>
						<span classList={{ active: participant.dinner }}>Dinner</span>
						<span classList={{ active: participant.overnight }}>Overnight</span>
					</li>
				))
		}
	</>

}
