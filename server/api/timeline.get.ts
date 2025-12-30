import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { parseActors } from "~~/server/utils/rdf";
import type { ASCollection, EnrichedPost } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, DATA_PATHS } from "~~/shared/constants";

export default defineEventHandler((event): ASCollection<EnrichedPost> => {
  const postsBaseDir = resolve(process.cwd(), DATA_PATHS.POSTS);
  const allPosts: EnrichedPost[] = [];
  const actors = parseActors();

  if (existsSync(postsBaseDir)) {
    const actorDirs = readdirSync(postsBaseDir);
    for (const actorDir of actorDirs) {
      const actorPath = resolve(postsBaseDir, actorDir);
      if (existsSync(actorPath)) {
        const files = readdirSync(actorPath).filter(f => f.endsWith('.json') || f.endsWith('.jsonld'));
        const actor = actors.find(a => a.preferredUsername === actorDir);

        for (const file of files) {
          try {
            const content = JSON.parse(readFileSync(resolve(actorPath, file), 'utf-8')) as EnrichedPost;
            // Enrich with actor info if available
            if (actor) {
              content.actor = actor;
            }

            allPosts.push(content);
          } catch (e) {
            console.error(`Error parsing post file ${file} in ${actorDir}:`, e);
          }
        }
      }
    }
  }

  // Sort by published date descending
  allPosts.sort((a, b) => {
    const dateA = a.published ? new Date(a.published).getTime() : 0;
    const dateB = b.published ? new Date(b.published).getTime() : 0;
    return dateB - dateA;
  });

  return {
    "@context": NAMESPACES.ACTIVITYSTREAMS,
    type: ACTIVITY_TYPES.ORDERED_COLLECTION,
    totalItems: allPosts.length,
    orderedItems: allPosts
  };
});
