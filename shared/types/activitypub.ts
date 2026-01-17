export interface ASObject {
  "@context"?: string | any[];
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
  avatar?: string;
  inbox: string;
  outbox: string;
  following?: string;
  followers?: string;
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
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
}

export interface ASCollection<T> extends ASObject {
  type: "Collection" | "OrderedCollection";
  totalItems: number;
  items?: T[];
  orderedItems?: T[];
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
  actor?: MythActor;
}
