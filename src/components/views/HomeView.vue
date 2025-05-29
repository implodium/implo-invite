<script setup lang="ts">
import { type RecordModel } from 'pocketbase'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePocketBase } from '../../composables/usePocketBase'

const pb = usePocketBase()
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
	<div class="bg-black text-white">
		<div v-if="user">{{ user }}</div>
		<RouterLink v-if="!pb.authStore.isValid" to="/login">Login</RouterLink>
		<button @click="() => logout()">Logout</button>
	</div>
</template>


<style scoped></style>
