<script setup lang="ts">
import PocketBase, { type RecordModel } from 'pocketbase'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const pb = new PocketBase('http://localhost:8090')
const router = useRouter()

const user = ref<RecordModel | undefined>(undefined)

function logout() {
	pb.authStore.clear()
	router.push('/login')
}

onMounted(async () => {
	user.value = await pb.collection('users').getOne(pb.authStore.record?.id ?? '')
})

</script>

<template>
	<div>
		<div v-if="user">{{ user }}</div>
		<RouterLink to="/login">Login</RouterLink>
		<button @click="() => logout()">Logout</button>
	</div>
</template>


<style scoped></style>
