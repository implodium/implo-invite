<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { type AuthProviderInfo } from 'pocketbase'
import { usePocketBase } from '../../composables/usePocketBase';

const pb = usePocketBase()
const redirect = "http://localhost:5173/redirect"
const providers = ref<AuthProviderInfo[] | undefined>(undefined)

onMounted(async () => {
	const authMethods = await pb.collection('users').listAuthMethods()
	providers.value = authMethods.oauth2.providers
})

function login(provider: AuthProviderInfo) {
	localStorage.setItem('provider', JSON.stringify(provider))
}

</script>

<template>
	<div>
		<ul v-if="providers">
			<li v-for="provider in providers">
				<a :href="provider.authURL + redirect" @click="login(provider)">{{ provider.name }}</a>
			</li>
		</ul>
		<div v-else>Loading Loign Provider ...</div>
	</div>
</template>

<style scoped></style>
