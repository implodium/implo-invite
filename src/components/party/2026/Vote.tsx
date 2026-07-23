import { createSignal, onMount, Show } from "solid-js"
import { Button } from "./Button";
import { actions } from "astro:actions";
import { VoteConfig } from "../../../config/vote";
import { Modal } from "./Modal";
import { authClient } from "../../../utils/auth_client";

export type Props = {
	restaurants: string[]
}

export function Vote(props: Props) {
	const [showModal, setShowModal] = createSignal(false)
	const [modalText, setModalText] = createSignal("")
	const [selected, setSelected] = createSignal<string[]>([])
	const [voteWasSubmittedAlready, setVoteWasSubmittedAlready] = createSignal(false)
	const [error, setError] = createSignal<string | undefined>(undefined)
	const isDisabled = () => selected().length > VoteConfig.maximumVoteCount
		|| selected().length < VoteConfig.minimumVoteCount

	onMount(async () => {
		const { data: vote, error } = await actions.voting2026.getVote({ eventId: 'ImploParty2026' })

		if (error) {
			return
		}

		setSelected(vote)
		setVoteWasSubmittedAlready(true)
	})

	function addSelected(restaurant: string) {
		if (selected().length >= VoteConfig.maximumVoteCount) {
			return;
		}
		setSelected(selected => [...selected, restaurant])
	}

	function removeSelected(restaurant: string) {
		setSelected(selected => selected.filter(r => r !== restaurant))
	}

	function toggleSelected(restaurant: string) {
		if (selected().includes(restaurant)) {
			removeSelected(restaurant)
		} else {
			addSelected(restaurant)
		}
	}

	async function submitVote() {
		const { error } = await actions.voting2026.submitVote({ restaurants: selected(), eventId: 'ImploParty2026' })

		if (error) {
			setError(error.message)
			return
		} else {
			setError(undefined)
			openModal(voteWasSubmittedAlready() ? "Successfully updated your vote" : "Successfully submitted your vote")
		}

		setVoteWasSubmittedAlready(true)
	}

	function RestaurantList() {
		return props.restaurants
			.map(restaurant => <>
				<li
					style={{ cursor: "pointer", "list-style": "none" }}
					onclick={() => toggleSelected(restaurant)}
				>[{selected().indexOf(restaurant) + 1}] {restaurant}</li>
			</>)

	}

	function openModal(text: string) {
		setModalText(text)
		setShowModal(true)

		setTimeout(() => {
			setShowModal(false)
		}, 1000)
	}

	async function logout() {
		await authClient.signOut()
		window.location.reload()
	}


	return <div class="vote">
		<header>
			<h1>Vote</h1>
			<Button onclick={logout}><i class="hn hn-logout"></i></Button>
		</header>

		<h2>{VoteConfig.message()}</h2>
		<Show when={error() !== undefined}>
			<h2 style={{ color: 'red' }}>
				{error()}
			</h2>
		</Show>

		<ul class="restaurant-list">
			<RestaurantList />
		</ul>

		<div>
			<Button fullWidth disabled={isDisabled()} onclick={() => submitVote()}>{voteWasSubmittedAlready() ? 'Update' : 'Submit'}</Button>
		</div>

		<Modal show={showModal()}>  {modalText()} </Modal>
	</div>
}
