<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/authStore';

const auth = useAuthStore();

const showLoginModal = ref(false);
const validationError = ref<string | null>(null);

const showLoginPrompt = computed(() => !auth.isLoggedIn);

onMounted(() => {
	const urlParams = new URLSearchParams(window.location.search);
	const errorParam = urlParams.get('error');
	if (errorParam) {
		validationError.value = decodeURIComponent(errorParam);
	}
});
</script>

<template>
	<div>
		<UContainer>
			<div class="max-w-lg mx-auto py-12">
				<UAlert
					v-if="validationError"
					icon="i-heroicons-exclamation-triangle"
					color="red"
					variant="soft"
					:title="validationError"
					:description="validationError.includes('not supported') ? 'This application requires an ActivityPods provider with ActivityStreams support. Generic Solid Pods are not supported.' : ''"
					class="mb-6"
					:actions="[{
						label: 'Try Again',
						color: 'red',
						variant: 'soft',
						click: () => { validationError = null; showLoginModal = true; }
					}]"
				/>

				<UCard v-if="showLoginPrompt">
					<div class="text-center py-8">
						<UIcon name="i-heroicons-lock-closed" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
						<h2 class="text-xl font-semibold mb-2">Login Required</h2>
						<p class="text-gray-500 dark:text-gray-400 mb-4">
							You need to be logged in with an ActivityPods provider.
						</p>
						<p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
							<strong>Note:</strong> Only ActivityPods providers are supported. Generic Solid Pods will be rejected.
						</p>
						<div class="flex gap-3 justify-center">
							<UButton to="/" variant="ghost" color="neutral">
								Go Back
							</UButton>
							<UButton icon="i-heroicons-arrow-right-on-rectangle" @click="showLoginModal = true">
								Login with ActivityPods
							</UButton>
						</div>
					</div>
				</UCard>

				<UCard v-else>
					<div class="text-center py-8">
						<UIcon name="i-heroicons-check-circle" class="w-12 h-12 mx-auto text-green-500 mb-4" />
						<h2 class="text-xl font-semibold mb-2">You're all set!</h2>
						<p class="text-gray-500 dark:text-gray-400 mb-4">
							Your ActivityPods account is connected and ready to use.
						</p>
						<div class="space-y-2 text-sm text-left mb-6 max-w-sm mx-auto">
							<div class="flex items-center gap-2">
								<UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500" />
								<span>WebID: <code class="text-xs">{{ auth.webId }}</code></span>
							</div>
							<div v-if="auth.inbox" class="flex items-center gap-2">
								<UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500" />
								<span>Inbox configured</span>
							</div>
							<div v-if="auth.outbox" class="flex items-center gap-2">
								<UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500" />
								<span>Outbox configured</span>
							</div>
						</div>
						<UButton to="/" color="primary">
							Go to Timeline
						</UButton>
					</div>
				</UCard>
			</div>
		</UContainer>

		<LoginModal v-model="showLoginModal" />
	</div>
</template>
