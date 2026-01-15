// import { useAuthStore } from '~/stores/auth'
// import { useTimelineStore } from '~/stores/timeline'
// import type { EnrichedPost } from '~~/shared/types/activitypub'
//
// export const useActivityPub = function () {
//   const auth = useAuthStore()
//   const timelineStore = useTimelineStore()
//
//   const likePost = async function (post: EnrichedPost): Promise<void> {
//     if (!auth.isLoggedIn) {
//       return
//     }
//     return timelineStore.likePost({ post })
//   }
//
//   const undoLikePost = async function (post: EnrichedPost): Promise<void> {
//     if (!auth.isLoggedIn) {
//       return
//     }
//     return timelineStore.undoLikePost({ post })
//   }
//
//   const replyToPost = async function (post: EnrichedPost, content: string): Promise<void> {
//     if (!auth.isLoggedIn) {
//       return
//     }
//     return (timelineStore as any).replyToPost({ post, content })
//   }
//
//   return {
//     likePost,
//     undoLikePost,
//     replyToPost
//   }
// }
