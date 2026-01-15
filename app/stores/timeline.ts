import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import { NAMESPACES, ACTIVITY_TYPES } from '~~/shared/constants'
import type { EnrichedPost, ASCollection } from '~~/shared/types/activitypub'
import {fetchTimeline} from "~/api/timeline";


export const useTimelineStore = defineStore('timeline', () => {
  const queryCache = useQueryCache()
  const auth = useAuthStore()

  const { data: timeline, status, refresh, isLoading } = useQuery({
    key: ['timeline'],
    query: () => fetchTimeline(),
  })

//   const { mutate: likePost } = useMutation({
//     mutation: async (variables: LikePostVariables) => {
//       const { post } = variables
//       const actor = post.actor
//       if (!actor || !actor.inbox) {
//         throw new Error("Target actor or inbox not found")
//       }
//
//       const likeActivity = {
//         "@context": NAMESPACES.ACTIVITYSTREAMS,
//         "type": ACTIVITY_TYPES.LIKE,
//         "id": `${window.location.origin}/activities/${Date.now()}`,
//         "actor": auth.webId,
//         "object": post.id,
//         "to": [actor.id]
//       }
//
//       const promises = [
//         auth.session?.fetch(actor.inbox, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/ld+json'
//           },
//           body: JSON.stringify(likeActivity)
//         })
//       ]
//
//       if (auth.outbox) {
//         promises.push(
//           auth.session.fetch(auth.outbox, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/ld+json'
//             },
//             body: JSON.stringify(likeActivity)
//           })
//         )
//       }
//
//       const responses = await Promise.all(promises)
//       if (!responses.some(r => r.ok)) {
//         throw new Error("Failed to post like activity")
//       }
//     },
//     async onMutate(variables: LikePostVariables) {
//       const { post } = variables
//       await queryCache.cancelQueries({ key: ['timeline'] })
//       const previousTimeline = queryCache.getQueryData(['timeline'])
//
//       queryCache.setQueryData(['timeline'], (old: any) => {
//         if (!old || !old.orderedItems) return old
//
//         const newItems = old.orderedItems.map((p: EnrichedPost) => {
//           if (p.id === post.id) {
//             const webId = auth.session.info.webId
//             if (!webId) return p
//
//             const newPost = JSON.parse(JSON.stringify(p)) as EnrichedPost
//
//             if (!newPost.likes) {
//               newPost.likes = {
//                 id: `${newPost.id}/likes`,
//                 type: ACTIVITY_TYPES.ORDERED_COLLECTION,
//                 totalItems: 0,
//                 orderedItems: []
//               } as ASCollection<string>
//             }
//
//             const likesCollection = (newPost.likes as ASCollection<string>);
//             const people = likesCollection.orderedItems || [];
//
//             if (!people.includes(webId)) {
//               people.push(webId);
//               likesCollection.totalItems = people.length;
//             }
//
//             return newPost
//           }
//           return p
//         })
//
//         return {
//           ...old,
//           orderedItems: newItems
//         }
//       })
//
//       return { previousTimeline }
//     },
//     onError(_err, _post, context: any) {
//       if (context?.previousTimeline) {
//         queryCache.setQueryData(['timeline'], context.previousTimeline)
//       }
//     },
//     onSettled() {
//       queryCache.invalidateQueries({ key: ['timeline'] });
//     }
//   })
//
//   const { mutate: undoLikePost } = useMutation({
//     mutation: async (variables: UndoLikePostVariables) => {
//       const { post } = variables
//       const actor = post.actor
//       if (!actor || !actor.inbox) {
//         throw new Error("Target actor or inbox not found")
//       }
//
//       const undoActivity = {
//         "@context": NAMESPACES.ACTIVITYSTREAMS,
//         "type": "Undo",
//         "id": `${window.location.origin}/activities/${Date.now()}-undo`,
//         "actor": auth.session.info.webId,
//         "object": {
//           "type": ACTIVITY_TYPES.LIKE,
//           "actor": auth.session.info.webId,
//           "object": post.id
//         },
//         "to": [actor.id]
//       }
//
//       const promises = [
//         auth.session.fetch(actor.inbox, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/ld+json'
//           },
//           body: JSON.stringify(undoActivity)
//         })
//       ]
//
//       if (auth.outbox) {
//         promises.push(
//           auth.session.fetch(auth.outbox, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/ld+json'
//             },
//             body: JSON.stringify(undoActivity)
//           })
//         )
//       }
//
//       const responses = await Promise.all(promises)
//       if (!responses.some(r => r.ok)) {
//         throw new Error("Failed to post undo activity")
//       }
//     },
//     async onMutate(variables: UndoLikePostVariables) {
//       const { post } = variables
//       queryCache.cancelQueries({key: ['timeline']})
//       const previousTimeline = queryCache.getQueryData(['timeline'])
//
//       queryCache.setQueryData(['timeline'], (old: any) => {
//         if (!old || !old.orderedItems) return old
//
//         const newItems = old.orderedItems.map((p: EnrichedPost) => {
//           if (p.id === post.id) {
//             const webId = auth.session.info.webId
//             if (!webId) return p
//
//             const newPost = JSON.parse(JSON.stringify(p)) as EnrichedPost
//
//             if (newPost.likes) {
//               const likesCollection = newPost.likes as ASCollection<string>
//               if (likesCollection.orderedItems) {
//                 likesCollection.orderedItems = likesCollection.orderedItems.filter((id: string) => id !== webId)
//                 likesCollection.totalItems = likesCollection.orderedItems.length
//               } else if (likesCollection.items) {
//                 likesCollection.items = likesCollection.items.filter((id: string) => id !== webId)
//                 likesCollection.totalItems = likesCollection.items.length
//               }
//             }
//             return newPost
//           }
//           return p
//         })
//
//         return {
//           ...old,
//           orderedItems: newItems
//         };
//       });
//
//       return { previousTimeline }
//     },
//     onError(_err, _post, context: any) {
//       if (context?.previousTimeline) {
//         queryCache.setQueryData(['timeline'], context.previousTimeline)
//       }
//     },
//     onSettled() {
//       queryCache.invalidateQueries({ key: ['timeline'] })
//     }
//   })
//
//   const { mutate: replyToPost } = useMutation({
//     mutation: async (variables: ReplyToPostVariables) => {
//       const { post, content } = variables
//       const actor = post.actor
//       if (!actor || !actor.inbox) {
//         throw new Error("Target actor or inbox not found")
//       }
//
//       if (!auth.outbox) {
//         throw new Error("Your outbox is not configured. Please complete the setup.")
//       }
//
//       const timestamp = Date.now()
//       const replyId = `${auth.outbox}${timestamp}-reply`
//
//       const replyNote = {
//         "@context": NAMESPACES.ACTIVITYSTREAMS,
//         "type": ACTIVITY_TYPES.NOTE,
//         "id": replyId,
//         "attributedTo": auth.session.info.webId,
//         "content": content,
//         "inReplyTo": post.id,
//         "to": [NAMESPACES.PUBLIC, actor.id],
//         "cc": [],
//         "published": new Date().toISOString()
//       }
//
//       try {
//         const replyResponse = await auth.session.fetch(replyId, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/ld+json',
//             'Link': '<http://www.w3.org/ns/ldp#Resource>; rel="type"'
//           },
//           body: JSON.stringify(replyNote)
//         })
//
//         if (!replyResponse.ok) {
//           throw new Error(`Failed to save reply note: ${replyResponse.statusText}`)
//         }
//
//         try {
//           const aclUrl = `${replyId}.acl`
//           const aclContent = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.
//
// <#public>
//     a acl:Authorization;
//     acl:agentClass acl:Agent;
//     acl:accessTo <${replyId}>;
//     acl:mode acl:Read.
//
// <#owner>
//     a acl:Authorization;
//     acl:agent <${auth.session.info.webId}>;
//     acl:accessTo <${replyId}>;
//     acl:mode acl:Read, acl:Write, acl:Control.`
//
//           await auth.session.fetch(aclUrl, {
//             method: 'PUT',
//             headers: {
//               'Content-Type': 'text/turtle'
//             },
//             body: aclContent
//           })
//         } catch (aclError) {
//           console.warn('Could not set ACL for reply (may not be supported):', aclError)
//         }
//       } catch (error) {
//         console.error('Failed to save reply note:', error)
//         throw new Error("Failed to save reply to your outbox")
//       }
//
//       const createActivity = {
//         "@context": NAMESPACES.ACTIVITYSTREAMS,
//         "type": ACTIVITY_TYPES.CREATE,
//         "id": `${auth.outbox}${timestamp}-create`,
//         "actor": auth.session.info.webId,
//         "object": replyNote,
//         "to": [NAMESPACES.PUBLIC, actor.id],
//         "published": replyNote.published
//       }
//
//       const inboxResponse = await auth.session.fetch(actor.inbox, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/ld+json'
//         },
//         body: JSON.stringify(createActivity)
//       })
//
//       if (!inboxResponse.ok) {
//         throw new Error(`Failed to send reply to actor's inbox: ${inboxResponse.statusText}`)
//       }
//
//       return { replyNote, createActivity }
//     },
//     async onMutate(variables: ReplyToPostVariables) {
//       const { post } = variables
//       await queryCache.cancelQueries({ key: ['timeline'] })
//       const previousTimeline = queryCache.getQueryData(['timeline'])
//
//       queryCache.setQueryData(['timeline'], (old: any) => {
//         if (!old || !old.orderedItems) return old
//
//         const newItems = old.orderedItems.map((p: EnrichedPost) => {
//           if (p.id === post.id) {
//             const newPost = JSON.parse(JSON.stringify(p)) as EnrichedPost
//
//             if (!newPost.replies) {
//               newPost.replies = {
//                 id: `${newPost.id}/replies`,
//                 type: ACTIVITY_TYPES.ORDERED_COLLECTION,
//                 totalItems: 0,
//                 orderedItems: []
//               } as ASCollection<string>
//             }
//
//             const repliesCollection = newPost.replies as ASCollection<string>
//             repliesCollection.totalItems += 1
//
//             return newPost
//           }
//           return p
//         })
//
//         return {
//           ...old,
//           orderedItems: newItems
//         }
//       })
//
//       return { previousTimeline }
//     },
//     onError(_err, _post, context: any) {
//       if (context?.previousTimeline) {
//         queryCache.setQueryData(['timeline'], context.previousTimeline)
//       }
//     },
//     onSettled() {
//       queryCache.invalidateQueries({ key: ['timeline'] })
//     }
//   })

  return {
    timeline,
    status,
    refresh,
    isLoading,
    // likePost,
    // undoLikePost,
    // replyToPost
  }
})
