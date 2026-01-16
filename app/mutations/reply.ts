import { useMutation, useQueryCache } from '@pinia/colada';
import { useAuthStore } from '~/stores/authStore';
import { useActivityPodsAuth } from '~/composables/useActivityPodsAuth';
import type { EnrichedPost } from '~~/shared/types/activitypub';
import { NAMESPACES, ACTIVITY_TYPES } from '~~/shared/constants';

export const useReplyMutation = function () {
	const auth = useAuthStore();
	const queryCache = useQueryCache();
	const { fetchWithAuth } = useActivityPodsAuth();

	return useMutation({
		mutation: async ({ post, content }: { post: EnrichedPost; content: string }) => {
			if (!auth.session || !auth.webId) {
				throw new Error('Not authenticated');
			}

			if (!auth.inbox || !auth.outbox) {
				throw new Error('Inbox or outbox not configured');
			}

			if (!post.actor?.inbox) {
				throw new Error('Target actor inbox not found');
			}

			if (!content.trim()) {
				throw new Error('Reply content cannot be empty');
			}

			const timestamp = Date.now();
			const replyId = `${auth.outbox}/${timestamp}-reply`;

			const replyNote = {
				'@context': NAMESPACES.ACTIVITYSTREAMS,
				type: ACTIVITY_TYPES.NOTE,
				id: replyId,
				attributedTo: auth.webId,
				content: content.trim(),
				inReplyTo: post.id,
				to: [NAMESPACES.PUBLIC, post.actor.id],
				published: new Date().toISOString(),
			};

			const createActivity = {
				'@context': NAMESPACES.ACTIVITYSTREAMS,
				type: ACTIVITY_TYPES.CREATE,
				id: `${auth.outbox}/${timestamp}-create`,
				actor: auth.webId,
				object: replyNote,
				to: [NAMESPACES.PUBLIC, post.actor.id],
				published: replyNote.published,
			};

			const targetInboxResponse = await fetchWithAuth(
				auth.session,
				post.actor.inbox,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/ld+json',
					},
					body: JSON.stringify(createActivity),
				}
			);

			if (!targetInboxResponse.ok) {
				const errorText = await targetInboxResponse.text();
				console.error('Failed to send reply to target inbox:', errorText);
				throw new Error('Failed to send reply to target inbox');
			}

			const outboxResponse = await fetchWithAuth(
				auth.session,
				auth.outbox,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/ld+json',
					},
					body: JSON.stringify(createActivity),
				}
			);

			if (!outboxResponse.ok) {
				console.warn('Failed to post to own outbox, but reply was sent to target');
			}

			return { replyNote, createActivity };
		},
		onSuccess: () => {
			queryCache.invalidateQueries({ key: ['timeline'] });
			queryCache.invalidateQueries({ key: ['post'] });
			queryCache.invalidateQueries({ key: ['replies'] });
			queryCache.invalidateQueries({ key: ['actor-posts'] });
		},
		onError: (error) => {
			console.error('Failed to post reply:', error);
		},
	});
};
