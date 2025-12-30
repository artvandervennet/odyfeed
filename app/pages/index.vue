<script setup lang="ts">
import { useSolidAuth } from "~/composables/useSolidAuth";

const { solidLogin, handleRedirect, isLoggedIn, session } = useSolidAuth();

const { data: timeline } = await useFetch('/api/timeline');

onMounted(async () => {
  await handleRedirect();
});
</script>

<template>
  <div class="container">
    <header>
      <h1>OdyFeed</h1>
      <div v-if="isLoggedIn" class="user-info">
        <span>Logged in as: {{ session.info.webId }}</span>
        <button @click="() => session.logout()">Logout</button>
      </div>
      <button v-else @click="solidLogin" class="login-btn">Login with Solid/ActivityPods</button>
    </header>

    <main>
      <h2>Timeline</h2>
      <div v-if="timeline" class="timeline">
        <article v-for="post in timeline" :key="post.id" class="post">
          <div class="post-header">
            <img v-if="post.actor.icon" :src="post.actor.icon.url" class="avatar" />
            <div class="actor-info">
              <strong>{{ post.actor.name }}</strong>
              <span class="username">@{{ post.actor.preferredUsername }}</span>
              <span class="tone" v-if="post.actor.tone">({{ post.actor.tone }})</span>
            </div>
          </div>
          <h3>{{ post.object.title }}</h3>
          <p>{{ post.object.content }}</p>
          <div class="post-footer">
            <time>{{ new Date(post.published).toLocaleString() }}</time>
          </div>
        </article>
      </div>
      <div v-else>Loading timeline...</div>
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}
.post {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fafafa;
}
.post-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  color: #666;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.actor-info {
  display: flex;
  flex-direction: column;
}
.username {
  font-size: 0.8rem;
}
.tone {
  font-style: italic;
  font-size: 0.8rem;
}
.post-footer {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #999;
}
.login-btn {
  padding: 0.5rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
