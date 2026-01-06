import { getAllActors } from "~~/server/utils/firestore";
import { DEFAULTS, NAMESPACES } from "~~/shared/constants";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl || DEFAULTS.BASE_URL;

  const actors = await getAllActors();

  setResponseHeader(event, "Content-Type", "application/ld+json");

  return {
    "@context": {
      "myth": `${baseUrl}/vocab#`,
      "foaf": "http://xmlns.com/foaf/0.1/",
      "as": "https://www.w3.org/ns/activitystreams#"
    },
    "@graph": actors.map(actor => ({
      "@id": `${baseUrl}/actors/${actor.preferredUsername}`,
      "@type": "myth:Actor",
      "foaf:name": actor.name,
      "myth:tone": actor.tone,
      ...(actor.summary && { "as:summary": actor.summary }),
      ...(actor.avatar && { "myth:avatar": actor.avatar })
    }))
  };
});
