export interface ASObject {
  "@context"?: string | string[] | Record<string, unknown>;
  id: string;
  type: string;
  name?: string;
  summary?: string;
  published?: string;
  url?: string;
}

export interface ASActor extends ASObject {
  type: "Person" | "Service" | "Application" | "Group" | "Organization";
  name: string;
  preferredUsername: string;
  inbox: string;
  outbox: string;
  following?: string;
  followers?: string;
  icon?: {
    type: "Image";
    url: string;
    mediaType?: string;
  };
  image?: {
    type: "Image";
    url: string;
    mediaType?: string;
  };
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
  url?: string;
  manuallyApprovesFollowers?: boolean;
  discoverable?: boolean;
  indexable?: boolean;
  memorial?: boolean;
  suspended?: boolean;
  featured?: string;
  featuredTags?: string;
  endpoints?: {
    sharedInbox?: string;
  };
}

export interface WebmentionObject extends ASObject {
  type: "Webmention";
  source: string;
  webmentionType: "comment" | "like" | "mention" | "repost";
  author?: {
    type: "Person";
    name?: string;
    url?: string;
    photo?: string;
  };
  content?: string;
  received: string;
}

export interface ASNote extends ASObject {
  type: "Note";
  attributedTo: string;
  content: string;
  to: string[];
  cc?: string[];
  likes?: ASCollection<string>;
  inReplyTo?: string;
  replies?: ASCollection<string>;
  webmentions?: ASCollection<WebmentionObject>;
  "myth:aboutEvent"?: string;
  sensitive?: boolean;
  atomUri?: string;
  inReplyToAtomUri?: string | null;
  conversation?: string;
  context?: string;
  attachment?: any[];
  tag?: any[];
}

export interface ASCollection<T> extends ASObject {
  type: "Collection" | "OrderedCollection" | "CollectionPage" | "OrderedCollectionPage";
  totalItems: number;
  items?: T[];
  orderedItems?: T[];
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
  partOf?: string;
}

export interface ASActivity extends ASObject {
  actor: string;
  object: string | ASObject;
  target?: string;
}

export interface MythActor {
  id: string;
  preferredUsername: string;
  name: string;
  summary: string;
  tone: string;
  avatar: string;
  inbox: string;
  outbox: string;
  icon?: {
    type: "Image";
    url: string;
    mediaType?: string;
  };
  image?: {
    type: "Image";
    url: string;
    mediaType?: string;
  };
}

export interface MythEvent {
  id: string;
  title: string;
  description: string;
  sequence: number;
  published: string;
  actors: MythActor[];
}

export interface EnrichedPost extends ASNote {
  actor?: ASActor | MythActor;
}
