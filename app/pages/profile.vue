<script setup lang="ts">
import EmptyState from "~/components/atoms/EmptyState.vue";

const auth = useAuth()
const { isLoggedIn, userProfile, webId, logout, inbox, outbox, actorId } = auth

const displayName = computed(() => userProfile.value?.name || userProfile.value?.preferredUsername || 'Your Profile')

const username = computed(() => userProfile.value?.preferredUsername || extractUsernameFromWebId(webId.value))

const extractUsernameFromWebId = function (webId: string): string {
	try {
		const url = new URL(webId)
		return url.hostname.split('.')[0] || 'user'
	} catch {
		return 'user'
	}
}
</script>

<template>
  <div>
    <div class="band page-head" data-paint="deep">
      <div class="inner">
        <template v-if="isLoggedIn">
          <div class="profile-id">
            <ActorAvatar :avatar-url="userProfile?.avatar" :username="username" size="lg" />
            <div>
              <h1>{{ displayName }}</h1>
              <p class="profile-handle">@{{ username }}</p>
              <art-tape>Your profile</art-tape>
            </div>
          </div>
          <p v-if="userProfile?.summary" class="lead">{{ userProfile.summary }}</p>
        </template>
        <h1 v-else>Your profile</h1>
      </div>
      <art-drip class="band-drip" pigment="--surface" seed="profile" count="9" stagger flush/>
    </div>

    <div v-if="!isLoggedIn" class="band" data-paint="1">
      <div class="inner narrow">
        <EmptyState
          title="Authentication Required"
          description="Please log in to view your profile."
          action-label="Go to Home"
          action-to="/"
        />
      </div>
    </div>

    <template v-else>
      <section class="band section" data-paint="1" aria-labelledby="profile-info-h">
        <div class="inner">
          <div class="section-head">
            <h2 id="profile-info-h" class="section-title">Profile Information</h2>
          </div>
          <div class="section-body">
            <dl class="card facts">
              <div>
                <dt>Display Name</dt>
                <dd>{{ userProfile?.name || 'Not set' }}</dd>
              </div>
              <div>
                <dt>Username</dt>
                <dd>{{ username }}</dd>
              </div>
              <div>
                <dt>Preferred Username</dt>
                <dd>{{ userProfile?.preferredUsername || 'Not set' }}</dd>
              </div>
              <div>
                <dt>Actor ID</dt>
                <dd class="address">{{ actorId || 'Not set' }}</dd>
              </div>
              <div>
                <dt>WebID</dt>
                <dd class="address">{{ webId }}</dd>
              </div>
              <div v-if="inbox">
                <dt>Inbox</dt>
                <dd class="address">{{ inbox }}</dd>
              </div>
              <div v-if="outbox">
                <dt>Outbox</dt>
                <dd class="address">{{ outbox }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section class="band section" data-paint="2" aria-labelledby="account-h">
        <div class="inner">
          <div class="section-head">
            <h2 id="account-h" class="section-title">Account Actions</h2>
          </div>
          <div class="section-body">
            <art-button variant="secondary">
              <button type="button" @click="logout">Log out</button>
            </art-button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
