<script setup lang="ts">
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { usePocketBase } from './composables/usePocketBase'

const pb = usePocketBase()
const router = useRouter()

onBeforeRouteLeave(() => {
	if (!pb.authStore.isValid) {
		router.push('/login')
	}
})

</script>

<template>
	<RouterView />
</template>

<style scoped></style>
