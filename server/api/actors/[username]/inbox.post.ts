import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import type { ASActivity, ASNote } from "~~/shared/types/activitypub";
import { ACTIVITY_TYPES, DATA_PATHS } from "~~/shared/constants";

export default defineEventHandler(async (event) => {
  const username = event.context.params?.username;
  const body = await readBody<ASActivity>(event);

  if (!body || !body.type) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid activity",
    });
  }

  // Sla de ruwe activiteit op in de inbox
  const inboxDir = resolve(process.cwd(), `data/inbox/${username}`);
  if (!existsSync(inboxDir)) {
    mkdirSync(inboxDir, { recursive: true });
  }
  const filename = `${Date.now()}-${body.type.toLowerCase()}.jsonld`;
  writeFileSync(resolve(inboxDir, filename), JSON.stringify(body, null, 2));

  // Verwerk Like activiteit
  if (body.type === ACTIVITY_TYPES.LIKE) {
    const targetId = typeof body.object === 'string' ? body.object : (body.object as any)?.id; // De URL van de post die geliked wordt
    if (targetId && typeof targetId === 'string') {
      // Extraheer de actor en post ID uit de URL
      // Bijvoorbeeld: http://localhost:3000/actors/odysseus/statuses/01-trojan-horse
      try {
        const url = new URL(targetId);
        const parts = url.pathname.split('/');
        // /actors/{username}/statuses/{id}
        const targetActor = parts[2];
        const postId = parts[4];

        if (targetActor && postId) {
          const postPath = resolve(process.cwd(), `${DATA_PATHS.POSTS}/${targetActor}/${postId}.jsonld`);
          if (existsSync(postPath)) {
            const post = JSON.parse(readFileSync(postPath, 'utf-8')) as ASNote;
            const actorWebId = body.actor;

            if (actorWebId && typeof actorWebId === 'string') {
              if (!post.likes) {
                post.likes = {
                  id: `${post.id}/likes`,
                  type: ACTIVITY_TYPES.COLLECTION,
                  totalItems: 0,
                  items: []
                };
              }

              // Support both simple array and Collection object for backward compatibility or flexibility
              if (Array.isArray(post.likes)) {
                if (!(post.likes as any).includes(actorWebId)) {
                  (post.likes as any).push(actorWebId);
                }
              } else if (post.likes?.items && !post.likes.items.includes(actorWebId)) {
                post.likes.items.push(actorWebId);
                post.likes.totalItems = post.likes.items.length;
              }
              
              writeFileSync(postPath, JSON.stringify(post, null, 2));
            }
          }
        }
      } catch (e) {
        console.error("Error processing like target URL:", e);
      }
    }
  }

  return setResponseStatus(event, 202);
});
