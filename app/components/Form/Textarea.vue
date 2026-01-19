<script setup lang="ts">
interface Props {
	label?: string
	hint?: string
	error?: string
	required?: boolean
	modelValue?: string
	placeholder?: string
	disabled?: boolean
	rows?: number
}

const props = defineProps<Props>()

const modelValue = defineModel<string>()

const emit = defineEmits<{
	blur: []
	focus: []
}>()

const textareaId = computed(() => `textarea-${Math.random().toString(36).slice(2, 9)}`)

const hasError = computed(() => !!props.error)
</script>

<template>
	<div class="space-y-2">
		<label
			v-if="label"
			:for="textareaId"
			class="block text-sm font-medium text-gray-700 dark:text-gray-300"
		>
			{{ label }}
			<span v-if="!required" class="text-s text-gray-500">optional</span>
      <p v-if="hint && !error" class="text-xs text-gray-500 dark:text-gray-400">
        {{ hint }}
      </p>

      <p v-if="error" class="text-xs text-red-500">
        {{ error }}
      </p>
		</label>

		<UTextarea
			:id="textareaId"
			v-model="modelValue"
			:placeholder="placeholder"
			:disabled="disabled"
			:rows="rows || 3"
			:color="hasError ? 'error' : 'primary'"
			size="md"
			@blur="emit('blur')"
			@focus="emit('focus')"
		/>


	</div>
</template>
