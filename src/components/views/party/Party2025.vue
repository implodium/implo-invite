<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui';
import { computed } from 'vue';
import { ref } from 'vue';
import { usePocketBase } from '../../../composables/usePocketBase';
import { onMounted } from 'vue';
import type { ImploParty2025 } from '../../../util/event-types/implo_party_2025';
import type { Event } from '../../../util/types';
import { en } from '@nuxt/ui/runtime/locale/index.js';

// const EVENT_NAME = 'Implo Party 2025';
const EVENT_ID = '5khz1v36q0hp2tp'
const pb = usePocketBase();
const event = ref<Event | undefined>(undefined);

const info = computed<ImploParty2025>(() => {
	return event.value?.information;
})

const timestamps = computed(() => {
	return info.value?.timestamps;
})

const stepperTimeStamps = computed<StepperItem[]>(() => {
	return timestamps.value?.map((timestamp) => {
		const date = ["Start", "Ende"].includes(timestamp.title) ? timestamp.date : "";
		const title = `${date} ${timestamp.time}: ${timestamp.title}`;
		const extra = timestamp.extra !== undefined ? `${timestamp.extra}: ` : '';
		const description = `${extra} ${timestamp.location}`
		return {
			title: title,
			description: description,
			icon: timestamp.icon,
		}
	})
})

const stepperActive = computed(() => stepperTimeStamps.value.length - 1)

onMounted(async () => {
	event.value = await pb.collection('events').getOne(EVENT_ID)
})
</script>

<template>
	<div class="w-screen h-screen flex justify-center items-center" v-if="info && timestamps && stepperTimeStamps">
		<UCard variant="subtle" class="aspect-12/16 h-11/12" as="main"
			:ui="{ body: 'flex flex-row h-full w-full divide-x-2' }">
			<template #default>
				<section class="w-full flex items-center flex-col gap-10 pr-5">
					<img class="w-8/12" src="/logos/Party2025.svg" alt="">
					<UStepper class="w-full" disabled :items="stepperTimeStamps" v-model="stepperActive" />

					<USeparator label="Einkaufen" :ui="{ label: 'text-3xl' }" />
					<div class="flex flex-row gap-10 w-full">
						<UAlert variant="subtle" class="grow" title="Location" icon="material-symbols:location-on"
							:description="info.shopping.location" />
						<UAlert variant="subtle" class="grow" title="Date" icon="material-symbols:calendar-month"
							:description="info.shopping.date" />
						<UAlert variant="subtle" class="grow" title="Time"
							icon="material-symbols:nest-clock-farsight-analog-outline"
							:description="info.shopping.time" />
					</div>

					<USeparator label="Packing List" :ui="{ label: 'text-3xl' }" />
					<div class="flex flex-row justify-center gap-10 w-full">
						<UBadge variant="subtle" size="xl" v-for="entry in info.packingList" :icon="entry.icon">
							{{ entry.title }}
						</UBadge>
					</div>

					<USeparator label="Registration" :ui="{ label: 'text-3xl' }" />
					<div class="flex flex-row gap-5 w-full">
						<UButton class="py-5 flex justify-center items-center grow" size="xl">Register</UButton>
						<UButton class="py-5 flex justify-center items-center grow" size="xl">Who is going?
						</UButton>
					</div>
				</section>
			</template>
		</UCard>
	</div>
</template>

<style scoped></style>
