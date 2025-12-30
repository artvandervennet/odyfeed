import { parseEvents, parseActors } from "~~/server/utils/rdf";

export default defineEventHandler((event) => {
  const actorId = event.context.params?.actor;
  const actors = parseActors();
  const actor = actors.find(a => a.id.endsWith(`/${actorId}`));

  if (!actor) {
    throw createError({
      statusCode: 404,
      statusMessage: "Actor not found"
    });
  }

  const allEvents = parseEvents();
  const actorEvents = allEvents.filter(e => e.actorId === actor.id);

  const activities = actorEvents.map(e => ({
    id: `${e.id}/activity`,
    type: "Create",
    actor: actor.id,
    published: e.published || new Date().toISOString(),
    object: {
      id: e.id,
      type: "Note",
      attributedTo: actor.id,
      content: e.description,
      title: e.title,
      published: e.published || new Date().toISOString()
    }
  }));

  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: actor.outbox,
    type: "OrderedCollection",
    totalItems: activities.length,
    orderedItems: activities.reverse()
  };
});
