import { getAllEvents } from "~~/server/utils/firestore";
import { DEFAULTS } from "~~/shared/constants";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl || DEFAULTS.BASE_URL;

  const events = await getAllEvents();

  setResponseHeader(event, "Content-Type", "application/ld+json");

  return {
    "@context": {
      "myth": `${baseUrl}/vocab#`,
      "dct": "http://purl.org/dc/terms/",
      "as": "https://www.w3.org/ns/activitystreams#"
    },
    "@graph": events.map(event => ({
      "@id": `${baseUrl}/events/${event.id.split('/').pop()}`,
      "@type": "myth:Event",
      "dct:title": event.title,
      "myth:sequence": event.sequence,
      "myth:description": event.description,
      "myth:involvesActor": event.actors.map(a => `${baseUrl}/actors/${a.preferredUsername}`)
    }))
  };
});
