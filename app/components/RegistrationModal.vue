<script setup lang="ts">
import FormField from "~/components/atoms/FormField.vue";
import FormTextarea from "~/components/atoms/FormTextarea.vue";

const {registerUser} = useAuth()
const {validateUsername} = useFormValidation()

const username = ref('')
const name = ref('')
const summary = ref('')
const isRegistering = ref(false)
const errorMessage = ref('')

const validation = computed(() => validateUsername(username.value))
const isValidUsername = computed(() => validation.value.isValid)

const handleRegister = async function () {
  const validationResult = validateUsername(username.value)
  if (!validationResult.isValid) {
    errorMessage.value = validationResult.error
    return
  }

  isRegistering.value = true
  errorMessage.value = ''

  try {
    await registerUser(username.value, {
      name: name.value || username.value,
      summary: summary.value || `ActivityPub actor for ${username.value}`,
    })

    console.log('[Registration] User registered successfully')
  } catch (error) {
    const e = error as { statusCode?: number, message?: string }
    console.error('[Registration] Registration failed:', error)
    if (e?.statusCode === 409) {
      errorMessage.value = 'Username is already taken. Please choose another.'
    } else {
      errorMessage.value = e?.message || 'Registration failed. Please try again.'
    }
    isRegistering.value = false
  }
}
</script>

<template>
  <UModal
      :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
      title="Complete Your Profile"
      description="Create a username to start using OdyFeed"
  >
    <UButton
        label="Complete Setup"
        icon="i-heroicons-user-plus"
        size="sm"
        color="primary"
        variant="solid"
    />

    <template #body>
      <div class="space-y-5">
        <UAlert
            icon="i-heroicons-information-circle"
            color="primary"
            variant="soft"
            title="One more step!"
            description="Choose a username for your ActivityPub profile on this server."
        />

        <div class="space-y-3">
          <FormField
              v-model="username"
              label="Username"
              placeholder="odysseus"
              icon="i-heroicons-at-symbol"
              :disabled="isRegistering"
              :error="!isValidUsername && username.length > 0 ? validation.error : ''"
              hint="Only lowercase letters, numbers, hyphens, and underscores"
              required
              @enter="handleRegister"
          />

          <FormField
              v-model="name"
              label="Display Name"
              placeholder="Odysseus of Ithaca"
              icon="i-heroicons-user"
              :disabled="isRegistering"
              hint="Optional: How your name appears to others"
          />

          <FormTextarea
              v-model="summary"
              label="Bio"
              placeholder="King of Ithaca, wanderer, storyteller..."
              :disabled="isRegistering"
              :rows="3"
              hint="Optional: Tell others about yourself"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="space-y-3">
        <UAlert
            v-if="errorMessage"
            icon="i-heroicons-exclamation-triangle"
            color="error"
            variant="soft"
            :title="errorMessage"
            :close="{ color: 'error', variant: 'link' }"
            @close="errorMessage = ''"
        />
        <div class="flex items-center justify-end gap-3">
          <UButton
              label="Create Profile"
              icon="i-heroicons-check"
              trailing
              :loading="isRegistering"
              :disabled="!username || !isValidUsername || isRegistering"
              @click="handleRegister"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
