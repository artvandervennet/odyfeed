<script setup lang="ts">
import ActionButton from "~/components/atoms/ActionButton.vue";

interface Props {
	likesCount: number
	repliesCount: number
	isLiked: boolean
	isLikeLoading?: boolean
	isReplyLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
	like: [event: Event]
	reply: [event: Event]
}>()
</script>

<template>
	<div class="flex items-center gap-2">
		<ActionButton
			icon="i-heroicons-chat-bubble-left"
			:count="repliesCount"
			:loading="isReplyLoading"
			color="secondary"
			@click="emit('reply', $event)"
		/>
		<ActionButton
			:icon="isLiked ? 'i-heroicons-heart-20-solid' : 'i-heroicons-heart'"
			:count="likesCount"
			:loading="isLikeLoading"
			:color="isLiked ? 'primary' : 'secondary'"
			@click="emit('like', $event)"
		/>
	</div>
</template>
