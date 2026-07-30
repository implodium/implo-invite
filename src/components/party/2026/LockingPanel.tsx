import type { z } from "astro/zod"
import type { EventExtraLocksSchema } from "../../../utils/party/2026/type"
import { createMemo, createSignal, Show } from "solid-js"
import { Button } from "./Button"
import { actions } from "astro:actions"
import { Modal } from "./Modal"

type LockingPanelProps = {
	locks: z.infer<typeof EventExtraLocksSchema>
}

export function LockingPanel(props: LockingPanelProps) {
	const [locks, setLocks] = createSignal<z.infer<typeof EventExtraLocksSchema>>(props.locks)
	const [showModal, setShowModal] = createSignal(false)
	const [modalText, setModalText] = createSignal("")

	const isRegistrationLocked = createMemo(() => {
		const registrationLocks = locks().registration
		if (typeof registrationLocks === 'boolean') {
			return registrationLocks
		}

		return registrationLocks.flags.shopping
			|| registrationLocks.flags.lunch
			|| registrationLocks.flags.dinner
			|| registrationLocks.flags.overnight

	})

	const individualRegistrationLocks = createMemo(() => {
		const registrationLocks = locks().registration
		if (typeof registrationLocks === 'boolean') {
			if (registrationLocks) {
				return undefined
			} else {
				return {
					shopping: false,
					lunch: false,
					dinner: false,
					overnight: false,
				}
			}
		} else {
			return registrationLocks.flags
		}
	})

	async function saveLocks() {
		const result = await actions.locking2026.setLocks({
			locks: locks(),
			eventId: 'ImploParty2026'
		})

		if (result.error === undefined ) {
			openModal("Locks saved")
		} else {
			openModal("Failed to save locks")
		}
	}

	function openModal(text: string) {
		setModalText(text)
		setShowModal(true)

		setTimeout(() => {
			setShowModal(false)
		}, 1000)
	}


	return <div class="locking-panel">
		<div class="locking-check-pair">
			<input type="checkbox" checked={locks().voting} onChange={(e) => {
				setLocks({
					...locks(),
					voting: e.target.checked,
				})
			}} />
			<label>Voting</label>
		</div>
		<div class="locking-check-pair">
			<input type="checkbox" checked={isRegistrationLocked()} onChange={(e) => {
				setLocks({
					...locks(),
					registration: e.target.checked,
				})
			}} />
			<label>Registration</label>
		</div>

		<Show when={individualRegistrationLocks()}>
			{ individualLocks => <>
				<div class="locking-check-pair">
					<input type="checkbox" checked={individualLocks().shopping} onChange={(e) => {
						setLocks({
							...locks(),
							registration: {
								flags: {
									...individualLocks(),
									shopping: e.target.checked,
								}
							}
						})
					}} />
					<label>Shopping</label>
				</div>
				<div class="locking-check-pair">
					<input type="checkbox" checked={individualLocks().lunch} onChange={(e) => {
						setLocks({
							...locks(),
							registration: {
								flags: {
									...individualLocks(),
									lunch: e.target.checked,
								}
							}
						})
					}} />
					<label>Lunch</label>
				</div>
				<div class="locking-check-pair">
					<input type="checkbox" checked={individualLocks().dinner} onChange={(e) => {
						setLocks({
							...locks(),
							registration: {
								flags: {
									...individualLocks(),
									dinner: e.target.checked,
								}
							}
						})
					}} />
					<label>Dinner</label>
				</div>
				<div class="locking-check-pair">
					<input type="checkbox" checked={individualLocks().overnight} onChange={(e) => {
						setLocks({
							...locks(),
							registration: {
								flags: {
									...individualLocks(),
									overnight: e.target.checked,
								}
							}
						})
					}} />
					<label>Overnight</label>
				</div>
			</>}
		</Show>

		<Button onclick={saveLocks}> Save Locks </Button>
		<Modal show={showModal()}>  {modalText()} </Modal>
	</div>

}
