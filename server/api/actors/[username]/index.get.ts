import { parseActors } from "~~/server/utils/rdf";
import type { ASActor } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES } from "~~/shared/constants";

export default defineEventHandler((event): ASActor => {
  const username = event.context.params?.username;
  const actors = parseActors();
  const actor = actors.find(a => a.preferredUsername === username);

  if (!actor) {
    throw createError({
      statusCode: 404,
      statusMessage: "Actor not found"
    });
  }

  return {
    "@context": [
      NAMESPACES.ACTIVITYSTREAMS,
      NAMESPACES.SECURITY
    ],
    id: actor.id,
    type: ACTIVITY_TYPES.SERVICE,
    preferredUsername: actor.preferredUsername,
    name: actor.name,
    summary: actor.summary,
    icon: actor.avatar ? {
      type: ACTIVITY_TYPES.IMAGE,
      url: actor.avatar
    } : undefined,
    inbox: actor.inbox,
    outbox: actor.outbox,
    url: actor.id
  };
});
