<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { type AuthProviderInfo } from 'pocketbase'
import { usePocketBase } from '../../composables/usePocketBase';
import { computed } from 'vue';

const pb = usePocketBase()
const redirect = `${import.meta.env.VITE_WEB_URL ?? 'http://localhost:5173'}/redirect`
const providers = ref<AuthProviderInfo[] | undefined>(undefined)
const discord = computed(() => providers.value?.at(0))

onMounted(async () => {
	const authMethods = await pb.collection('users').listAuthMethods()
	providers.value = authMethods.oauth2.providers
	console.log(`${import.meta.env.VITE_WEB_URL ?? 'http://localhost:5173'}/redirect`)
})

function login(provider: AuthProviderInfo) {
	localStorage.setItem('provider', JSON.stringify(provider))
	window.location.href = provider.authURL + redirect
}

</script>

<template>
	<div class="w-screen h-screen flex justify-center items-center">
		<UButton v-if="discord" icon="ic:baseline-discord" @click="login(discord)" size="xl" :ui="{base: 'text-4xl', leadingIcon: 'size-12'}">Login</UButton>
		<div v-else class="flex justify-center flex-col items-center">
			<UIcon name="clarity:no-access-line" class="size-64 text-dimmed" />
			<div class="text-center">Loading Login Provider...</div>
			<div class="text-center">If this message does not disappear it means the server is down</div>
		</div>
	</div>
</template>

<style scoped></style>
