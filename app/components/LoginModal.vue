<script setup lang="ts">
import {useAuth} from '~/composables/useAuth'
import {useAuthProviders} from '~/composables/useAuthProviders'
import {useFormValidation} from '~/composables/useFormValidation'

// two root nodes (the button and the teleported dialog): attributes such as slot="actions" go on the button
defineOptions({inheritAttrs: false})

withDefaults(defineProps<{
  /** Show the "Log in" button that opens the dialog. Off when a page opens it itself, with v-model. */
  trigger?: boolean
}>(), {
  trigger: true,
})

const open = defineModel<boolean>({default: false})

const {login} = useAuth()
const {providers} = useAuthProviders()
const {validateRequired} = useFormValidation()

const issuer = ref('https://login.inrupt.com')
const customIssuer = ref('')
const useCustom = ref(false)
const isLoggingIn = ref(false)
const errorMessage = ref('')

// A native <dialog>: the browser traps focus in it, closes it on Escape, and puts focus back
// on the button that opened it.
const dialog = ref<HTMLDialogElement | null>(null)

watch([open, dialog], ([isOpen, el]) => {
  if (!el) return
  if (isOpen && !el.open) el.showModal()
  if (!isOpen && el.open) el.close()
})

const handleLogin = async function () {
  isLoggingIn.value = true
  errorMessage.value = ''

  try {
    const selectedIssuer = useCustom.value ? customIssuer.value : issuer.value

    const validation = validateRequired(selectedIssuer, 'Provider URL')
    if (!validation.isValid) {
      errorMessage.value = validation.error
      isLoggingIn.value = false
      return
    }

    await login(selectedIssuer)
  } catch (error) {
    errorMessage.value = 'Login failed. Please try again.'
    isLoggingIn.value = false
    console.error(error)
  }
}
</script>

<template>
  <art-button v-if="trigger" variant="quiet" size="s" v-bind="$attrs">
    <button type="button" @click="open = true">
      <Icon name="i-heroicons-arrow-right-on-rectangle" aria-hidden="true"/>
      Log in
    </button>
  </art-button>

  <!-- on <body>, so it takes the page's colours and not the header's paint -->
  <Teleport to="body">
    <dialog ref="dialog" class="dialog login" aria-labelledby="login-title" @close="open = false">
      <h2 id="login-title">Welcome to OdyFeed</h2>
      <p class="intro">Log in to your Solid Pod to get started</p>

      <form @submit.prevent="handleLogin">
        <fieldset v-if="!useCustom" class="choices">
          <legend>Choose your Pod provider</legend>
          <label v-for="provider in providers" :key="provider.url" class="choice">
            <input v-model="issuer" type="radio" name="provider" :value="provider.url">
            <Icon :name="provider.icon" aria-hidden="true"/>
            <span>
              <strong>{{ provider.name }}</strong>
              <small>{{ provider.description }}</small>
            </span>
          </label>
        </fieldset>

        <div v-else class="field">
          <label for="custom-issuer">Custom Pod provider URL</label>
          <input
              id="custom-issuer"
              v-model="customIssuer"
              type="url"
              inputmode="url"
              autocomplete="url"
              placeholder="https://vandervennet.art"
          >
        </div>

        <art-button variant="quiet" size="s">
          <button type="button" @click="useCustom = !useCustom">
            {{ useCustom ? 'Back to providers' : 'Use custom provider' }}
          </button>
        </art-button>

        <p v-if="errorMessage" class="form-message" role="alert">{{ errorMessage }}</p>

        <p class="hint">
          New to Solid?
          <a href="https://solidproject.org/users/get-a-pod" target="_blank" rel="noopener">Get a Pod</a>
        </p>

        <div class="actions">
          <art-button variant="quiet">
            <button type="button" @click="open = false">Cancel</button>
          </art-button>
          <art-button>
            <button type="submit" :disabled="isLoggingIn || (useCustom && !customIssuer)">
              {{ isLoggingIn ? 'Logging in…' : 'Continue' }}
            </button>
          </art-button>
        </div>
      </form>
    </dialog>
  </Teleport>
</template>
