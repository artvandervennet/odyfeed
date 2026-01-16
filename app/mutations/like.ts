import { useMutation, useQueryCache } from '@pinia/colada';
import { useAuthStore } from '~/stores/authStore';
import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth';
import type { EnrichedPost } from '~~/shared/types/activitypub';
import { NAMESPACES, ACTIVITY_TYPES } from '~~/shared/constants';

export const useLikeMutation = function () {
	const auth = useAuthStore();
	const queryCache = useQueryCache();
	const { fetchWithAuth } = useActivityPodsAuth();

	return useMutation({
		mutation: async (post: EnrichedPost) => {
			if (!auth.session || !auth.webId) {
				throw new Error('Not authenticated');
			}

			if (!auth.inbox || !auth.outbox) {
				throw new Error('Inbox or outbox not configured');
			}

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found');
			}

			const likeActivity = {
				'@context': NAMESPACES.ACTIVITYSTREAMS,
				type: ACTIVITY_TYPES.LIKE,
				id: `${auth.outbox}/${Date.now()}-like`,
				actor: auth.webId,
				object: post.id,
				to: [post.actor.id],
			};

			const targetInboxResponse = await fetchWithAuth(
				auth.session,
				post.actor.inbox,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/ld+json',
					},
					body: JSON.stringify(likeActivity),
				}
			);

			if (!targetInboxResponse.ok) {
				const errorText = await targetInboxResponse.text();
				console.error('Failed to send like to target inbox:', errorText);
				throw new Error('Failed to send like to target inbox');
			}

			const outboxResponse = await fetchWithAuth(
				auth.session,
				auth.outbox,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/ld+json',
					},
					body: JSON.stringify(likeActivity),
				}
			);

			if (!outboxResponse.ok) {
				console.warn('Failed to post to own outbox, but like was sent to target');
			}

			return likeActivity;
		},
		onSuccess: () => {
			queryCache.invalidateQueries({ key: ['timeline'] });
			queryCache.invalidateQueries({ key: ['post'] });
			queryCache.invalidateQueries({ key: ['actor-posts'] });
		},
		onError: (error) => {
			console.error('Failed to like post:', error);
		},
	});
};

export const useUndoLikeMutation = function () {
	const auth = useAuthStore();
	const queryCache = useQueryCache();
	const { fetchWithAuth } = useActivityPodsAuth();

	return useMutation({
		mutation: async (post: EnrichedPost) => {
			if (!auth.session || !auth.webId) {
				throw new Error('Not authenticated');
			}

			if (!auth.inbox || !auth.outbox) {
				throw new Error('Inbox or outbox not configured');
			}

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found');
			}

			const undoActivity = {
				'@context': NAMESPACES.ACTIVITYSTREAMS,
				type: ACTIVITY_TYPES.UNDO,
				id: `${auth.outbox}/${Date.now()}-undo`,
				actor: auth.webId,
				object: {
					type: ACTIVITY_TYPES.LIKE,
					actor: auth.webId,
					object: post.id,
				},
				to: [post.actor.id],
			};

			const targetInboxResponse = await fetchWithAuth(
				auth.session,
				post.actor.inbox,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/ld+json',
					},
					body: JSON.stringify(undoActivity),
				}
			);

			if (!targetInboxResponse.ok) {
				const errorText = await targetInboxResponse.text();
				console.error('Failed to send undo to target inbox:', errorText);
				throw new Error('Failed to send undo to target inbox');
			}

			const outboxResponse = await fetchWithAuth(
				auth.session,
				auth.outbox,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/ld+json',
					},
					body: JSON.stringify(undoActivity),
				}
			);

			if (!outboxResponse.ok) {
				console.warn('Failed to post to own outbox, but undo was sent to target');
			}

			return undoActivity;
		},
		onSuccess: () => {
			queryCache.invalidateQueries({ key: ['timeline'] });
			queryCache.invalidateQueries({ key: ['post'] });
			queryCache.invalidateQueries({ key: ['actor-posts'] });
		},
		onError: (error) => {
			console.error('Failed to undo like:', error);
		},
	});
};
