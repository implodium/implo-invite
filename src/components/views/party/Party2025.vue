<script setup lang="ts">

</script>

<template>
	<div class="w-screen h-screen flex justify-center items-center">
		<UCard variant="subtle" class="aspect-video w-8/12" as="main" :ui="{ body: 'flex flex-row h-full w-full' }">
			<template #default>
				<section class="w-1/2 h-full"></section>
				<section class="w-1/2 f-full"></section>
			</template>
		</UCard>
	</div>
</template>

<style scoped></style>
