<script setup lang="ts">
import PocketBase, { type OAuth2AuthConfig } from 'pocketbase'
import { onMounted, ref } from 'vue';

const pb = new PocketBase('http://127.0.0.1:8090')
const userData = ref<any | undefined>(undefined)

onMounted(async () => {
	const options: OAuth2AuthConfig = {
		provider: 'discord'
	}

	console.log('authenticating')
	userData.value = await pb.collection('users')
		.authWithOAuth2(options)
		.catch(err => console.error(err))

	console.log('authenticated', userData.value)
})


</script>

<template>
	<main>
		{{ userData }}
	</main>
</template>

<style scoped></style>
