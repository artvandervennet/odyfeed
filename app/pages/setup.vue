<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { usePodSetup } from '~/composables/usePodSetup';

const auth = useAuthStore();
const { setupPod, isSettingUp, error } = usePodSetup();

const name = ref('');
const handle = ref('');

onMounted(async () => {
  await auth.handleRedirect();
  if (!auth.isLoggedIn) {
    navigateTo('/');
    return;
  }
  
  await auth.fetchProfile();
  
  // Pre-fill if some data exists
  name.value = auth.name || '';
  handle.value = auth.preferredUsername || '';
  
  if (!handle.value && auth.user?.webId) {
    // Try to guess a handle from WebID
    const url = new URL(auth.user.webId);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      let last = parts.pop();
      // Common Solid filenames to ignore
      if ((last === 'card' || last === 'profile' || last === 'index') && parts.length > 0) {
        last = parts.pop();
      }
      handle.value = last || '';
    }
  }
});

async function handleSetup() {
  const success = await setupPod({
    name: name.value,
    handle: handle.value
  });
  
  if (success) {
    await auth.fetchProfile();
    navigateTo('/');
  }
}
</script>

<template>
  <UContainer>
    <div class="max-w-md mx-auto py-12">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-primary-500" />
            <h1 class="text-xl font-bold">Complete your Profile</h1>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            Your Pod is almost ready. We need to set up an inbox, outbox and profile to get you started.
          </p>
        </template>

        <form @submit.prevent="handleSetup" class="space-y-4">
          <UFormField label="Display Name" name="name" required>
            <UInput v-model="name" placeholder="e.g. John Doe" icon="i-heroicons-user" />
          </UFormField>

          <UFormField label="Username / Handle" name="handle" required help="This will be your identifier in the Odysee.">
            <UInput v-model="handle" placeholder="e.g. johndoe" icon="i-heroicons-at-symbol" />
          </UFormField>

          <div v-if="error" class="p-3 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-circle" />
            <span>{{ error }}</span>
          </div>

          <UButton
            type="submit"
            color="primary"
            block
            :loading="isSettingUp"
            :disabled="!name || !handle || isSettingUp"
          >
            {{ isSettingUp ? 'Setting up Pod...' : 'Initialize my Pod' }}
          </UButton>
        </form>

        <template #footer>
          <p class="text-xs text-center text-gray-400">
            This will create containers on your Pod and update your WebID to point to them.
          </p>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>
