<script setup lang="ts">
import PocketBase, { AuthProviderInfo } from 'pocketbase'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const pb = new PocketBase('http://localhost:8090')
const redirect = "http://localhost:5173/redirect"
const params = (new URL(window.location.href)).searchParams

const error = ref<string | undefined>(undefined)
const router = useRouter()


onMounted(async () => {
	const provider: AuthProviderInfo = JSON.parse(localStorage.getItem('provider'))
	if (provider.state !== params.get('state')) {
		error.value = 'Invalid State'
		return
	}

	const user = await pb.collection('users').authWithOAuth2Code(
		provider.name,
		params.get('code'),
		provider.codeVerifier,
		redirect,
	)

	console.log(user)
	router.push('/')
})


</script>

<template>
	<div v-if="error">
		{{ error }}
	</div>
</template>


<style scoped></style>
