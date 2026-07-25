import { Button } from "./Button";
import { createSignal, For, Show } from "solid-js";
import { actions } from "astro:actions";
import type { z } from "astro/zod";
import type { RegistrationOptionsSchema } from "../../../utils/shared_types";
import { Modal } from "./Modal";
import { authClient } from "../../../utils/auth_client";

type Person = {
	name: string,
	shopping: boolean,
	lunch: boolean,
	dinner: boolean,
	overnight: boolean
}

type RegistrationProps = {
	user: {
		name: string,
	},
	registration: z.infer<typeof RegistrationOptionsSchema> | undefined
}

export function Registration(props: RegistrationProps) {
	const [userPerson, setUserPerson] = createSignal<Person>({
		name: props.user.name,
		shopping: props.registration?.shopping ?? false,
		lunch: props.registration?.lunch ?? false,
		dinner: props.registration?.dinner ?? false,
		overnight: props.registration?.overnight ?? false
	})

	const [showModal, setShowModal] = createSignal(false)
	const [showInfoModal, setShowInfoModal] = createSignal(false)
	const [modalText, setModalText] = createSignal("")
	const [alreadyRegistered, setAlreadyRegistered] = createSignal(props.registration ? true : false)
	const registrationButtonDisabled = () => {
		return otherPeople().some(person => person.name.length === 0)
	}

	const [otherPeople, setOtherPeople] = createSignal<Person[]>(props.registration?.otherPeople ?? [])

	function Checkbox(props: { enabled: boolean, onChange?: (enabled: boolean) => void }) {
		return <div class="checkbox-container">
			<label class="checkbox">
				<span> [ </span>
				<input type="checkbox" checked={props.enabled} onChange={(e) => {
					props.onChange?.(e.currentTarget.checked)
				}} />
				<i class="check-icon hn hn-check"></i>
				<span> ] </span>
			</label>
		</div>
	}

	function PersonRegistration(props: { person: Person, pinned?: boolean, onChange: (people: Person) => void, onDelete?: () => void }) {
		const person = () => props.person;
		const pinned = () => props.pinned ?? false;

		function NameDisplay() {
			if (pinned()) {
				return <span class="name-display"> {person().name} </span>
			} else {
				return <input
					placeholder="Name"
					class="name-display"
					value={person().name}
					onchange={(e) => props.onChange({ ...person(), name: e.target.value })}
				/>
			}
		}

		return <tr class="table-row">
			<td> <NameDisplay /> </td>
			<td> <Checkbox enabled={person().shopping} onChange={(enabled) => props.onChange({ ...person(), shopping: enabled })} /> </td>
			<td> <Checkbox enabled={person().lunch} onChange={(enabled) => props.onChange({ ...person(), lunch: enabled })} /> </td>
			<td> <Checkbox enabled={person().dinner} onChange={(enabled) => props.onChange({ ...person(), dinner: enabled })} /> </td>
			<td> <Checkbox enabled={person().overnight} onChange={(enabled) => props.onChange({ ...person(), overnight: enabled })} /> </td>
			<Show when={!props.pinned}>
				<td> <Button variant="ghost" onclick={() => props.onDelete?.()}><i class="hn hn-trash"></i></Button> </td>
			</Show>
		</tr>
	}

	function updatePerson(index: number, person: Person) {
		setOtherPeople((previous) => {
			const newPeople = [...previous]
			newPeople[index] = person
			return newPeople
		})

	}

	function addNewPerson() {
		setOtherPeople(otherPeople => [...otherPeople, { name: "", shopping: false, lunch: false, dinner: false, overnight: false }])
	}

	async function register() {
		const registrationResponse = await actions.registration.registerOrUpdate({
			eventId: "ImploParty2026",
			registrationOptions: {
				shopping: userPerson().shopping,
				lunch: userPerson().lunch,
				dinner: userPerson().dinner,
				overnight: userPerson().overnight,
				otherPeople: otherPeople().map(person => {
					return {
						name: person.name,
						shopping: person.shopping,
						lunch: person.lunch,
						dinner: person.dinner,
						overnight: person.overnight
					}
				})
			}
		})

		if (registrationResponse.error) {
			openModal("Registration failed")
		} else {
			openModal(alreadyRegistered() ? "Successfully updated registration" : "Successfully registered")
			setAlreadyRegistered(true)
		}
	}

	function deleteOtherPersonAt(index: number) {
		setOtherPeople((previous) => {
			return previous.filter((_, i) => i !== index)
		})
	}

	function Info() {
		return <i class="hn hn-info-circle" onclick={() => openInfoModal()}></i>
	}

	function openModal(text: string) {
		setModalText(text)
		setShowModal(true)

		setTimeout(() => {
			setShowModal(false)
		}, 1000)
	}

	function openInfoModal() {
		setShowInfoModal(true)

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				setShowInfoModal(false)
			}
		}, { once: true })
	}


	async function logout() {
		await authClient.signOut()
		window.location.reload()

	}


	return <div class="registration-container registration">
		<header>
			<h1>Party Registration</h1>
			<Button onclick={logout}><i class="hn hn-logout"></i></Button>
		</header>

		<div class="table-container">
			<table class="registration-table">
				<thead>
					<tr class="table-row">
						<th>Name <Info /></th>
						<th>Shopping <Info /> </th>
						<th>Lunch <Info /></th>
						<th>Dinner <Info /></th>
						<th>Overnight <Info /></th>
						<th></th>
					</tr>
				</thead>

				<tbody>
					<Show when={userPerson()}>
						{(person) => <PersonRegistration pinned person={person()} onChange={updatedPerson => setUserPerson((person) => ({ ...person, ...updatedPerson }))} />}
					</Show>
					<For each={otherPeople()}>
						{(person, index) => <PersonRegistration person={person} onChange={(person) => updatePerson(index(), person)} onDelete={() => deleteOtherPersonAt(index())} />}
					</For>

					<tr class="table-row">
						<td >
							<Button fullWidth onclick={() => addNewPerson()}> + 1 </Button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<Button fullWidth onclick={() => register()} disabled={registrationButtonDisabled()}>
			<Show when={alreadyRegistered()}>
				Update Registration
			</Show>
			<Show when={!alreadyRegistered()}>
				Register
			</Show>
		</Button>

		<Modal show={showModal()}>  {modalText()} </Modal>
		<Modal show={showInfoModal()}>
			<ul>
				<li>Name: Your Name. If you want to add a +1 press lie button</li>
				<li>Shopping: Joins Grocery Trip </li>
				<li>Lunch:  Requires Lunch Reservation</li>
				<li>Dinner: Requries Dinner Reservation</li>
				<li>Overnight: Stays lirough lie night</li>
			</ul>
		</Modal>
	</div>
}
