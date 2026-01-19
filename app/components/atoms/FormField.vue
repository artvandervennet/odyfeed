<script setup lang="ts">
interface Props {
	label?: string
	hint?: string
	error?: string
	required?: boolean
	modelValue?: string | number
	type?: 'text' | 'email' | 'url' | 'password'
	placeholder?: string
	disabled?: boolean
	icon?: string
	autocomplete?: string
}

const props = defineProps<Props>()

const modelValue = defineModel<string | number>()

const emit = defineEmits<{
	blur: []
	focus: []
	enter: []
}>()

const inputId = computed(() => `field-${Math.random().toString(36).slice(2, 9)}`)

const hasError = computed(() => !!props.error)
</script>

<template>
	<div class="space-y-2">
		<label
			v-if="label"
			:for="inputId"
			class="block text-sm font-medium text-gray-700 dark:text-gray-300"
		>
      <span>{{ label }}</span>

			<span v-if="!required" class="text-s text-gray-500">optional</span>
      <span v-if="hint && !error" class="text-xs text-gray-500 dark:text-gray-400">
        {{ hint }}
      </span>

      <span v-if="error" class="text-xs text-red-500">
        {{ error }}
      </span>
		</label>

		<UInput
			:id="inputId"
			v-model="modelValue"
			:type="type || 'text'"
			:placeholder="placeholder"
			:disabled="disabled"
			:icon="icon"
			:color="hasError ? 'error' : 'primary'"
			:autocomplete="autocomplete"
			size="md"
			@blur="emit('blur')"
			@focus="emit('focus')"
			@keyup.enter="emit('enter')"
		/>


	</div>
</template>
