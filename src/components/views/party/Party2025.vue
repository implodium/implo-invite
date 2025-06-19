<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui';
import { computed } from 'vue';
import { ref } from 'vue';
import { usePocketBase } from '../../../composables/usePocketBase';
import { onMounted } from 'vue';
import type { ImploParty2025 } from '../../../util/event-types/implo_party_2025';
import type { Event } from '../../../util/types';

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
		const title = timestamp.extra === undefined ? timestamp.title : `${timestamp.title}: ${timestamp.extra}`;
		return {
			title: title,
			description: timestamp.time,
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
		<UCard variant="subtle" class="aspect-video w-11/12" as="main"
			:ui="{ body: 'flex flex-row h-full w-full divide-x-2' }">
			<template #default>
				<section class="w-1/2 h-full flex items-center flex-col gap-10">
					<img class="w-8/12" src="/logos/Party2025.svg" alt="">
					<UStepper class="w-full" disabled :items="stepperTimeStamps" v-model="stepperActive" />
				</section>
				<section class="w-1/2 f-full"></section>
			</template>
		</UCard>
	</div>
</template>

<style scoped></style>
