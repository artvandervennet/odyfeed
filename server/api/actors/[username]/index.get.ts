import { parseActors } from "~~/server/utils/rdf";
import type { ASActor } from "~~/shared/types/activitypub";
import { NAMESPACES, ACTIVITY_TYPES } from "~~/shared/constants";
import {getActor} from "~~/server/utils/firestore";

export default defineEventHandler(async (event): Promise<ASActor> => {
  const username = event.context.params?.username;
  const actor = await getActor(username ?? "")

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
