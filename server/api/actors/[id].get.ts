import { parseActors } from "~~/server/utils/rdf";

export default defineEventHandler((event) => {
  const actorId = event.context.params?.id;
  const actors = parseActors();
  const actor = actors.find(a => a.id.endsWith(`/${actorId}`));

  if (!actor) {
    throw createError({
      statusCode: 404,
      statusMessage: "Actor not found"
    });
  }

  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1"
    ],
    id: actor.id,
    type: "Service",
    preferredUsername: actor.preferredUsername,
    name: actor.name,
    summary: actor.summary,
    icon: actor.avatar ? {
      type: "Image",
      url: actor.avatar
    } : undefined,
    inbox: actor.inbox,
    outbox: actor.outbox,
    url: actor.id
  };
});
