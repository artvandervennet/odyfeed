export const NAMESPACES = {
  ACTIVITYSTREAMS: "https://www.w3.org/ns/activitystreams",
  SECURITY: "https://w3id.org/security/v1",
  MYTH: "https://odyfeed.artvandervennet.ikdoeict.be/vocab#",
  FOAF: "http://xmlns.com/foaf/0.1/",
  RDFS: "http://www.w3.org/2000/01/rdf-schema#",
  DCT: "http://purl.org/dc/terms/",
  PUBLIC: "https://www.w3.org/ns/activitystreams#Public"
};

export const ACTIVITY_TYPES = {
  NOTE: "Note" as const,
  SERVICE: "Service" as const,
  IMAGE: "Image" as const,
  ORDERED_COLLECTION: "OrderedCollection" as const,
  COLLECTION: "Collection" as const,
  LIKE: "Like" as const
};

export const DATA_PATHS = {
  ACTORS: "data/actors/actors.jsonld",
  EVENTS: "data/events/events.jsonld",
  VOCAB: "data/vocab/myth.jsonld",
  POSTS: "data/posts"
};

export const DEFAULTS = {
  BASE_URL: "http://localhost:3000"
};
