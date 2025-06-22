<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui';
import { computed } from 'vue';
import { ref } from 'vue';
import { usePocketBase } from '../../../composables/usePocketBase';
import { onMounted } from 'vue';
import type { ImploParty2025 } from '../../../util/event-types/implo_party_2025';
import type { Event } from '../../../util/types';
import { useMediaQuery } from '@vueuse/core';
import { watch } from 'vue';

// const EVENT_NAME = 'Implo Party 2025';
const EVENT_ID = '5khz1v36q0hp2tp'
const pb = usePocketBase();
const event = ref<Event | undefined>(undefined);
const isDesktop = useMediaQuery('(min-width: 1011px');
const isTablet = useMediaQuery('(min-width: 768px');

watch(isDesktop, () => {
	console.log('isDesktop', isDesktop.value)
	console.log('isTablet', isTablet.value)
}, { deep: true })

const info = computed<ImploParty2025>(() => {
	return event.value?.information;
})

const timestamps = computed(() => {
	return info.value?.timestamps;
})

const stepperTimeStamps = computed<StepperItem[]>(() => {
	return timestamps.value?.map((timestamp) => {
		const extra = timestamp.extra !== undefined ? `${timestamp.extra}: ` : '';
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

function splitDescription(description: string): { datetime: string, location: string } {
	const [datetime, location] = description.split(';').map(s => s.trim());
	return { datetime, location }
}

const stepperActive = computed(() => stepperTimeStamps.value.length - 1)

onMounted(async () => {
	event.value = await pb.collection('events').getOne(EVENT_ID)
})
</script>

<template>
	<div class="w-screen h-screen flex justify-center items-center" v-if="info && timestamps && stepperTimeStamps">
		<UCard variant="subtle"
			class="w-full h-full desktop:aspect-14/16 desktop:w-auto desktop:max-h-11/12 desktop:h-auto overflow-auto"
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
					<div class="flex flex-row gap-5 w-full pb-10">
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
