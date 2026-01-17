export const NAMESPACES = {
  ACTIVITYSTREAMS: "https://www.w3.org/ns/activitystreams",
  SECURITY: "https://w3id.org/security/v1",
  MYTH: "https://odyfeed.artvandervennet.ikdoeict.be/vocab#",
  FOAF: "http://xmlns.com/foaf/0.1/",
  RDFS: "http://www.w3.org/2000/01/rdf-schema#",
  DCT: "http://purl.org/dc/terms/",
  PUBLIC: "https://www.w3.org/ns/activitystreams#Public",
  TOOT: "http://joinmastodon.org/ns#",
};

export const ACTIVITYPUB_CONTEXT = [
  "https://www.w3.org/ns/activitystreams",
  {
    "ostatus": "http://ostatus.org#",
    "atomUri": "ostatus:atomUri",
    "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
    "conversation": "ostatus:conversation",
    "sensitive": "as:sensitive",
    "toot": "http://joinmastodon.org/ns#",
    "votersCount": "toot:votersCount"
  }
];

export const ACTIVITY_TYPES = {
  NOTE: "Note" as const,
  SERVICE: "Service" as const,
  PERSON: "Person" as const,
  IMAGE: "Image" as const,
  ORDERED_COLLECTION: "OrderedCollection" as const,
  ORDERED_COLLECTION_PAGE: "OrderedCollectionPage" as const,
  COLLECTION: "Collection" as const,
  COLLECTION_PAGE: "CollectionPage" as const,
  LIKE: "Like" as const,
  UNDO: "Undo" as const,
  CREATE: "Create" as const,
  FOLLOW: "Follow" as const,
  ACCEPT: "Accept" as const,
};

export const ACTOR_TYPES = {
  BOT: "Person" as const,
  PERSON: "Person" as const,
} as const;

export const FILE_PATHS = {
  ACTORS: "actors.ttl",
  EVENTS: "events.ttl",
  VOCAB: "vocab.ttl",
  POSTS_DIR: "posts",
  ACTORS_DATA_DIR: "actors",
};

export const ENDPOINT_PATHS = {
  API_ACTORS: "/api/actors",
  API_TIMELINE: "/api/timeline",
  ACTORS_PROFILE: (username: string) => `/api/actors/${username}`,
  ACTORS_INBOX: (username: string) => `/api/actors/${username}/inbox`,
  ACTORS_OUTBOX: (username: string) => `/api/actors/${username}/outbox`,
  ACTORS_FOLLOWERS: (username: string) => `/api/actors/${username}/followers`,
  ACTORS_FOLLOWING: (username: string) => `/api/actors/${username}/following`,
  ACTOR_STATUS: (username: string, statusId: string) => `/api/actors/${username}/status/${statusId}`,
} as const;

export const DEFAULTS = {
  BASE_URL: "http://localhost:3000"
};
