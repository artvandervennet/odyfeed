import { getAllPosts } from "~~/server/utils/firestore";
import type { ASCollection, EnrichedPost } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES } from "~~/shared/constants";

export default defineEventHandler(async (event): Promise<ASCollection<EnrichedPost>> => {
  const allPosts = await getAllPosts(100);

  // Sort by published date descending (should already be sorted from Firestore)
  allPosts.sort((a, b) => {
    const dateA = a.published ? new Date(a.published).getTime() : 0;
    const dateB = b.published ? new Date(b.published).getTime() : 0;
    return dateB - dateA;
  });

  return {
    id: "",
    "@context": NAMESPACES.ACTIVITYSTREAMS,
    type: ACTIVITY_TYPES.ORDERED_COLLECTION,
    totalItems: allPosts.length,
    orderedItems: allPosts
  };
});
