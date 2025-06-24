<script setup lang="ts">
import type { StepperItem, TreeItem } from '@nuxt/ui';
import { computed } from 'vue';
import { ref } from 'vue';
import { usePocketBase } from '../../../composables/usePocketBase';
import { onMounted } from 'vue';
import type { ImploParty2025 } from '../../../util/event-types/implo_party_2025';
import type { Event, User, FormResult, Registration } from '../../../util/types';
import { useMediaQuery } from '@vueuse/core';
import { useRouter } from 'vue-router';

const EVENT_ID = '5khz1v36q0hp2tp'
const pb = usePocketBase();
const router = useRouter();
const event = ref<Event | undefined>(undefined);
const user = ref<User | undefined>(undefined);
const registration = ref<Registration<FormResult> | undefined>(undefined)
const isDesktop = useMediaQuery('(min-width: 1011px');
const isTablet = useMediaQuery('(min-width: 768px');
const registerModalOpen = ref(false)
const participantsModalOpen = ref(false)
const pollsModalOpen = ref(false)
const shoppingFilter = ref<boolean>(false)
const overnightFilter = ref<boolean>(false)
const dinnerFilter = ref<boolean>(false)
const formResults = ref({
	name: "",
	dinner: false,
	overnight: false,
	shopping: false
})

const plusOneResults = ref<FormResult[]>([])
const allRegistrations = ref<Registration<FormResult>[]>([])

const info = computed<ImploParty2025>(() => {
	return event.value?.information;
})

const timestamps = computed(() => {
	return info.value?.timestamps;
})

const stepperTimeStamps = computed<StepperItem[]>(() => {
	return timestamps.value?.map((timestamp) => {
		const extra = timestamp.extra !== undefined ? ` : ${timestamp.extra} ` : '';
		const title = `${timestamp.title} ${extra}`;
		const description = `${timestamp.date} ${timestamp.time} ; ${timestamp.location}`
		return {
			slot: 'default' as const,
			title: title,
			description: description,
			icon: timestamp.icon,
		}
	})
})

const participantTree = computed<TreeItem[]>(() => {
	return allRegistrations.value.map(r => {
		return {
			label: r.expand?.user_id.name.split("#")[0] ?? '??',
			icon: 'material-symbols:person',
			defaultExpanded: true,
			children: r.registration.others.map(o => {
				return {
					label: o.name.split("#")[0],
					icon: 'mdi:person-plus',
					children: []
				}
			})
		}
	})
})

function splitDescription(description: string): { datetime: string, location: string } {
	const [datetime, location] = description.split(';').map(s => s.trim());
	return { datetime, location }
}

const stepperActive = computed(() => stepperTimeStamps.value.length - 1)

function addPerson() {
	plusOneResults.value.push({
		name: "",
		dinner: false,
		overnight: false,
		shopping: false
	})
}

async function submitRegistration() {
	console.log(formResults.value)
	console.log(plusOneResults.value)

	if (user.value === undefined) {
		return
	}

	formResults.value.name = user.value.name
	const id = user.value.id

	const new_registration: Registration<FormResult> = {
		user_id: id,
		event_id: EVENT_ID,
		registration: {
			self: formResults.value,
			others: plusOneResults.value
		}
	}

	if (registration.value !== undefined && registration.value.id !== undefined) {
		registration.value = await pb.collection('registrations')
			.update(registration.value.id, new_registration)
	} else {
		registration.value = await pb.collection('registrations')
			.create(new_registration)
	}

	allRegistrations.value = await pb.collection('registrations').getFullList({ expand: 'user_id' })
	registerModalOpen.value = false
}

function removePlusOne(name: string) {
	plusOneResults.value = plusOneResults.value.filter(p => p.name !== name)
}

async function deleteRegistration() {
	if (registration.value === undefined || registration.value.id === undefined) {
		return
	}

	await pb.collection('registrations')
		.delete(registration.value.id)

	registerModalOpen.value = false

	registration.value = undefined

	formResults.value = {
		name: "",
		dinner: false,
		overnight: false,
		shopping: false
	}
	plusOneResults.value = []
}

onMounted(async () => {
	event.value = await pb.collection('events').getOne(EVENT_ID)
	user.value = await pb.collection('users').getOne(pb.authStore.record?.id ?? '')
	allRegistrations.value = await pb.collection('registrations').getFullList({ expand: 'user_id' })
	console.log("all", allRegistrations.value)
	registration.value = await getRegistration()

	formResults.value = registration.value?.registration.self ?? {
		name: "",
		dinner: false,
		overnight: false,
		shopping: false
	}

	plusOneResults.value = registration.value?.registration.others ?? []

	console.log(registration.value)
})

async function getRegistration(): Promise<Registration<FormResult> | undefined> {
	try {
		return await pb.collection('registrations')
			.getFirstListItem(`user_id="${user.value?.id}" && event_id="${EVENT_ID}"`)
	} catch (e) {
		return undefined
	}
}

function logout() {
	pb.authStore.clear()
	router.push('/login')
}
</script>

<template>
	<div class="w-screen h-screen flex justify-center items-center" v-if="info && timestamps && stepperTimeStamps">
		<div class="fixed top-0 right-0 p-5">
			<UButton @click="logout" icon="material-symbols:logout"></UButton>
		</div>
		<UModal v-model:open="pollsModalOpen" title="Polls"
			description="The polls are done in discord. Here is a link to the thread">
			<template #body>
				<span>this is a cool link</span>
			</template>
		</UModal>
		<UModal v-model:open="participantsModalOpen" title="Participants"
			description="Here are all the participants that have registered so far">
			<template #body>
				<div>
					<UButton variant="outline" color="neutral" @click="shoppingFilter = !shoppingFilter">Shopping
					</UButton>
				</div>
				<UTree disabled :items="participantTree" />
			</template>
		</UModal>
		<UModal v-model:open="registerModalOpen" title="Register to the Party"
			description="Enter your details into the form and press submit to register to the Party"
			:ui="{ body: 'flex gap-5 flex-col' }">
			<template #body>
				<UCard v-if="user" :title="user?.name" variant="outline">
					<template #header>
						{{ user.name.split("#")[0] }}
					</template>
					<template #default>
						<div class="flex justify-between">
							{{ info.form.dinner }}
							<USwitch v-model="formResults.dinner" />
						</div>
						<div class="flex justify-between">
							{{ info.form.shopping }}
							<USwitch v-model="formResults.shopping" />
						</div>
						<div class="flex justify-between">
							{{ info.form.overnight }}
							<USwitch v-model="formResults.overnight" />
						</div>
					</template>
				</UCard>
				<UCard v-if="user" v-for="plusOne in plusOneResults" :title="user?.name" variant="outline"
					:ui="{ header: 'flex justify-between items-center' }">
					<template #header>
						<span>{{ plusOne.name }}</span>
						<UButton @click="removePlusOne(plusOne.name)" icon="mdi:remove" variant="soft" />
					</template>
					<template #default>
						<div class="flex justify-between">
							{{ info.form.name }}
							<UInput v-model="plusOne.name" />
						</div>
						<div class="flex justify-between">
							{{ info.form.dinner }}
							<USwitch v-model="plusOne.dinner" />
						</div>
						<div class="flex justify-between">
							{{ info.form.shopping }}
							<USwitch v-model="plusOne.shopping" />
						</div>
						<div class="flex justify-between">
							{{ info.form.overnight }}
							<USwitch v-model="plusOne.overnight" />
						</div>
					</template>
				</UCard>
				<UTooltip :disabled="plusOneResults.length <= 2" text="You can only add up to 3 extra people">
					<UButton @click="addPerson" :disabled="plusOneResults.length > 2"
						class="flex justify-center items-center">Add
						Person
					</UButton>
				</UTooltip>
			</template>
			<template #footer>
				<UButton @click="submitRegistration">{{ registration === undefined ? 'Submit' : 'Save' }}</UButton>
				<UButton v-if="registration !== undefined" @click="deleteRegistration">Remove Registration</UButton>
			</template>
		</UModal>
		<UCard variant="subtle" class="w-full h-full desktop:w-8/12 desktop:max-h-11/12 desktop:h-auto overflow-auto"
			as="main" :ui="{ body: 'flex flex-row h-full w-full divide-x-2' }">
			<template #default>
				<section class="w-full flex items-center flex-col gap-10">
					<img class="w-8/12" src="/logos/Party2025.svg" alt="">
					<UStepper disabled :items="stepperTimeStamps" v-model="stepperActive"
						:orientation="isTablet ? 'horizontal' : 'vertical'"
						:ui="{ root: 'w-full', header: 'w-full', content: 'size-0' }">
						<template #title="{ item }">
							{{ item.title }}
						</template>
						<template #description="{ item }">
							<div v-if="isDesktop || isTablet">
								{{ splitDescription(item.description ?? ';').datetime }}
								<br>
								{{ splitDescription(item.description ?? ';').location }}
							</div>
							<div v-else>
								{{ item.description?.replace(';', ":") }}
							</div>
						</template>
					</UStepper>

					<USeparator label="Einkaufen" :ui="{ label: 'text-3xl' }" />
					<div class="flex flex-col gap-10 w-full tablet:flex-row">
						<UAlert variant="subtle" class="grow" title="Location" icon="material-symbols:location-on"
							:description="info.shopping.location" />
						<UAlert variant="subtle" class="grow" title="Date" icon="material-symbols:calendar-month"
							:description="info.shopping.date" />
						<UAlert variant="subtle" class="grow" title="Time"
							icon="material-symbols:nest-clock-farsight-analog-outline"
							:description="info.shopping.time" />
					</div>

					<USeparator label="Packing List" :ui="{ label: 'text-3xl' }" />
					<div class="flex flex-row justify-center gap-10 w-full flex-wrap">
						<UBadge variant="subtle" size="xl" v-for="entry in info.packingList" :icon="entry.icon">
							{{ entry.title }}
						</UBadge>
					</div>

					<USeparator label="Registration" :ui="{ label: 'text-3xl' }" />
					<div class="flex flex-col gap-5 w-full pb-10 desktop:pb-5 tablet:flex-row">
						<UButton class="py-5 flex justify-center items-center grow" @click="registerModalOpen = true"
							size="xl">
							{{ registration === undefined ? 'Register' : 'Edit Registration' }}</UButton>
						<UButton class="py-5 flex justify-center items-center grow"
							@click="participantsModalOpen = true" size="xl">
							Paticipants
						</UButton>
						<UButton class="py-5 flex justify-center items-center grow" @click="pollsModalOpen = true"
							size="xl">
							Polls
						</UButton>
					</div>
				</section>
			</template>
		</UCard>
	</div>
	<div class="flex justify-center items-center w-screen h-screen flex-col gap-10" v-else>
		<UIcon name="clarity:no-access-line" class="size-64 text-dimmed" />
		<div class="flex justify-center items-center flex-col">
			<h1 class="text-3xl text-dimmed">Ohh no! It seems like you are not yet invited to this event</h1>
			<h1 class="text-3xl text-dimmed">
				This could very well be a mistake. Contact the organizer (LebendeMoge) of this event
			</h1>
		</div>
	</div>
</template>

<style scoped></style>
