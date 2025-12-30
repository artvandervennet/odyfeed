import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { parseActors } from "~~/server/utils/rdf";
import type { ASCollection, ASNote } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES, DATA_PATHS } from "~~/shared/constants";

export default defineEventHandler((event): ASCollection<ASNote> => {
  const username = event.context.params?.username;
  const actors = parseActors();
  const actor = actors.find(a => a.preferredUsername === username);

  if (!actor) {
    throw createError({
      statusCode: 404,
      statusMessage: "Actor not found",
    });
  }

  const postsDir = resolve(process.cwd(), `${DATA_PATHS.POSTS}/${username}`);
  const posts: ASNote[] = [];

  if (existsSync(postsDir)) {
    const files = readdirSync(postsDir).filter(f => f.endsWith('.json') || f.endsWith('.jsonld'));
    for (const file of files) {
      const content = JSON.parse(readFileSync(resolve(postsDir, file), 'utf-8')) as ASNote;
      posts.push(content);
    }
  }

  return {
    "@context": NAMESPACES.ACTIVITYSTREAMS,
    id: actor.outbox,
    type: ACTIVITY_TYPES.ORDERED_COLLECTION,
    totalItems: posts.length,
    orderedItems: posts.sort((a, b) => {
      const dateA = a.published ? new Date(a.published).getTime() : 0;
      const dateB = b.published ? new Date(b.published).getTime() : 0;
      return dateB - dateA;
    })
  };
});
