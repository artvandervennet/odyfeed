import { parseActors } from "~~/server/utils/rdf";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const resource = query.resource as string;

  if (!resource) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing resource parameter',
    });
  }

  const actors = parseActors();
  
  // Try to find the actor by acct: URI or by their full ID URL
  const actor = actors.find(a => {
    const acct = `acct:${a.preferredUsername}@odyfeed.artvandervennet.ikdoeict.be`;
    return resource === acct || resource === a.id;
  });

  if (!actor) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Actor not found',
    });
  }

  return {
    subject: resource.startsWith('acct:') ? resource : `acct:${actor.preferredUsername}@odyfeed.artvandervennet.ikdoeict.be`,
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
