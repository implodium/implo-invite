<script setup lang="ts">
const isActive = defineModel<boolean>('isActive', { required: true })
defineProps<{
	title: string
}>()

function toggle() {
	isActive.value = !isActive.value
}
</script>

<template>
	<UButton @click="toggle" :color="isActive ? 'primary' : 'neutral'" variant="outline">
		{{ title }}
	</UButton>
</template>

<style scoped></style>
