import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { NAMESPACES, ACTIVITY_TYPES } from '~~/shared/constants';

export const useTimelineStore = defineStore('timeline', () => {
  const queryCache = useQueryCache();
  const auth = useAuthStore();

  const { data: timeline, status, refresh, isLoading } = useQuery({
    key: ['timeline'],
    query: () => $fetch('/api/timeline'),
  });

  const { mutate: likePost } = useMutation({
    mutation: async (variables: { post: any }) => {
      const { post } = variables;
      const actor = post.actor;
      if (!actor || !actor.inbox) {
        throw new Error("Target actor or inbox not found");
      }

      const likeActivity = {
        "@context": NAMESPACES.ACTIVITYSTREAMS,
        "type": ACTIVITY_TYPES.LIKE,
        "id": `${window.location.origin}/activities/${Date.now()}`,
        "actor": auth.session.info.webId,
        "object": post.id,
        "to": [actor.id]
      };

      const promises = [
        auth.session.fetch(actor.inbox, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/ld+json'
          },
          body: JSON.stringify(likeActivity)
        })
      ];

      if (auth.outbox) {
        promises.push(
          auth.session.fetch(auth.outbox, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/ld+json'
            },
            body: JSON.stringify(likeActivity)
          })
        );
      }

      const responses = await Promise.all(promises);
      if (!responses.some(r => r.ok)) {
        throw new Error("Failed to post like activity");
      }
    },
    async onMutate(variables: { post: any }) {
      const { post } = variables;
      await queryCache.cancelQueries({ key: ['timeline'] });
      const previousTimeline = queryCache.getQueryData(['timeline']);

      queryCache.setQueryData(['timeline'], (old: any) => {
        if (!old || !old.orderedItems) return old;

        const newItems = old.orderedItems.map((p: any) => {
          if (p.id === post.id) {
            const webId = auth.session.info.webId;
            const newPost = JSON.parse(JSON.stringify(p));

            if (!newPost.likes) {
              newPost.likes = {
                id: `${newPost.id}/likes`,
                type: ACTIVITY_TYPES.COLLECTION,
                totalItems: 0,
                items: []
              };
            }

            if (Array.isArray(newPost.likes)) {
              if (!newPost.likes.includes(webId)) {
                newPost.likes.push(webId);
              }
            } else if (newPost.likes.items) {
              if (!newPost.likes.items.includes(webId)) {
                newPost.likes.items.push(webId);
                newPost.likes.totalItems = newPost.likes.items.length;
              }
            }
            return newPost;
          }
          return p;
        });

        return {
          ...old,
          orderedItems: newItems
        };
      });

      return { previousTimeline };
    },
    onError(_err, _post, context: any) {
      if (context?.previousTimeline) {
        queryCache.setQueryData(['timeline'], context.previousTimeline);
      }
    },
    onSettled() {
      queryCache.invalidateQueries({ key: ['timeline'] });
    }
  });

  const { mutate: undoLikePost } = useMutation({
    mutation: async (variables: { post: any }) => {
      const { post } = variables;
      const actor = post.actor;
      if (!actor || !actor.inbox) {
        throw new Error("Target actor or inbox not found");
      }

      const undoActivity = {
        "@context": NAMESPACES.ACTIVITYSTREAMS,
        "type": "Undo",
        "id": `${window.location.origin}/activities/${Date.now()}-undo`,
        "actor": auth.session.info.webId,
        "object": {
          "type": ACTIVITY_TYPES.LIKE,
          "actor": auth.session.info.webId,
          "object": post.id
        },
        "to": [actor.id]
      };

      const promises = [
        auth.session.fetch(actor.inbox, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/ld+json'
          },
          body: JSON.stringify(undoActivity)
        })
      ];

      if (auth.outbox) {
        promises.push(
          auth.session.fetch(auth.outbox, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/ld+json'
            },
            body: JSON.stringify(undoActivity)
          })
        );
      }

      const responses = await Promise.all(promises);
      if (!responses.some(r => r.ok)) {
        throw new Error("Failed to post undo activity");
      }
    },
    async onMutate(variables: { post: any }) {
      const { post } = variables;
      queryCache.cancelQueries({key: ['timeline']});
      const previousTimeline = queryCache.getQueryData(['timeline']);

      queryCache.setQueryData(['timeline'], (old: any) => {
        if (!old || !old.orderedItems) return old;

        const newItems = old.orderedItems.map((p: any) => {
          if (p.id === post.id) {
            const webId = auth.session.info.webId;
            const newPost = JSON.parse(JSON.stringify(p));

            if (Array.isArray(newPost.likes)) {
              newPost.likes = newPost.likes.filter((id: string) => id !== webId);
            } else if (newPost.likes?.items) {
              newPost.likes.items = newPost.likes.items.filter((id: string) => id !== webId);
              newPost.likes.totalItems = newPost.likes.items.length;
            }
            return newPost;
          }
          return p;
        });

        return {
          ...old,
          orderedItems: newItems
        };
      });

      return { previousTimeline };
    },
    onError(_err, _post, context: any) {
      if (context?.previousTimeline) {
        queryCache.setQueryData(['timeline'], context.previousTimeline);
      }
    },
    onSettled() {
      queryCache.invalidateQueries({ key: ['timeline'] });
    }
  });

  return {
    timeline,
    status,
    refresh,
    isLoading,
    likePost,
    undoLikePost
  };
});
