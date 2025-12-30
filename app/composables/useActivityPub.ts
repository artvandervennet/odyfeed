import { useAuthStore } from '~/stores/auth';
import { useTimelineStore } from '~/stores/timeline';

export function useActivityPub() {
  const auth = useAuthStore();
  const timelineStore = useTimelineStore();

  async function likePost(post: any) {
    if (!auth.isLoggedIn) {
      return;
    }
    return timelineStore.likePost({ post });
  }

  async function undoLikePost(post: any) {
    if (!auth.isLoggedIn) {
      return;
    }
    return timelineStore.undoLikePost({ post });
  }

  return {
    likePost,
    undoLikePost
  };
}
