<script setup lang="ts">
import { type AuthProviderInfo } from 'pocketbase'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePocketBase } from '../../composables/usePocketBase'

const pb = usePocketBase()
const redirect = "http://localhost:5173/redirect"
const params = (new URL(window.location.href)).searchParams

const error = ref<string | undefined>(undefined)
const router = useRouter()


onMounted(async () => {
	const provider: AuthProviderInfo = JSON.parse(localStorage.getItem('provider') ?? '{}')
	if (provider.state !== params.get('state')) {
		error.value = 'Invalid State'
		return
	}

	const code = params.get('code')

	if (code === null) {
		error.value = 'No code'
		return
	}

	const user = await pb.collection('users').authWithOAuth2Code(
		provider.name,
		code,
		provider.codeVerifier,
		redirect,
	)

	pb.authStore.save(user.token, user.record)
	router.push('/')
})


</script>

<template>
	<div v-if="error">
		{{ error }}
	</div>
</template>


<style scoped></style>
