import { parseActors } from "~~/server/utils/rdf";
import type { MythActor } from "~~/shared/types/activitypub";
import { DEFAULTS } from "~~/shared/constants";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const resource = query.resource as string;

  if (!resource) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing resource parameter',
    });
  }

  const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL;
  const domain = new URL(baseUrl).host;

  const actors: MythActor[] = parseActors();
  
  // Try to find the actor by acct: URI or by their full ID URL
  const actor = actors.find(a => {
    const acct = `acct:${a.preferredUsername}@${domain}`;
    return resource === acct || resource === a.id;
  });

  if (!actor) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Actor not found',
    });
  }

  setHeader(event, 'Content-Type', 'application/jrd+json; charset=utf-8');
  setHeader(event, 'Access-Control-Allow-Origin', '*');

  return {
    subject: resource.startsWith('acct:') ? resource : `acct:${actor.preferredUsername}@${domain}`,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: actor.id,
      },
      {
        rel: 'http://webfinger.net/rel/profile-page',
        type: 'text/html',
        href: actor.id,
      }
    ],
  };
});
