import { useAuthStore } from '~/stores/auth';
import { useTimelineStore } from '~/stores/timeline';
import { NAMESPACES, ACTIVITY_TYPES } from "~~/shared/constants";

export function useActivityPub() {
  const auth = useAuthStore();
  const timelineStore = useTimelineStore();

  async function likePost(post: any) {
    if (!auth.isLoggedIn) {
      return;
    }

    const actor = post.actor;
    if (!actor || !actor.inbox) {
      console.error("Target actor or inbox not found");
      return;
    }

    const likeActivity = {
      "@context": NAMESPACES.ACTIVITYSTREAMS,
      "type": ACTIVITY_TYPES.LIKE,
      "id": `${window.location.origin}/activities/${Date.now()}`,
      "actor": auth.session.info.webId,
      "object": post.id,
      "to": [actor.id]
    };

    try {
      // If user has an outbox (ActivityPods), post there. 
      // Otherwise, post to the target's inbox directly.
      const targetUrl = auth.outbox || actor.inbox;

      const response = await auth.session.fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json'
        },
        body: JSON.stringify(likeActivity)
      });

      if (response.ok) {
        timelineStore.refresh();
      } else {
        console.error("Failed to post like activity:", response.status, await response.text());
      }
    } catch (e) {
      console.error("Error liking post:", e);
    }
  }

  return {
    likePost
  };
}
