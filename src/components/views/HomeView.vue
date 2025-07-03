<script setup lang="ts">
import { type RecordModel } from 'pocketbase'
import { onMounted, ref } from 'vue'
import { usePocketBase } from '../../composables/usePocketBase'

const pb = usePocketBase()
const user = ref<RecordModel | undefined>(undefined)

onMounted(async () => {
	user.value = await pb.collection('users').getOne(pb.authStore.record?.id ?? '')
})

</script>

<template>
	<div class="flex justify-center items-center w-screen h-screen">
		Ohh no! It seems like you have the wrong url
	</div>
</template>


<style scoped></style>
