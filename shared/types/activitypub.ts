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
  preferredUsername: string;
  inbox: string;
  outbox: string;
  following?: string;
  followers?: string;
  icon?: ASImage;
}

export interface ASImage {
  type: "Image";
  url: string;
}

export interface ASNote extends ASObject {
  type: "Note";
  attributedTo: string;
  content: string;
  to: string[];
  cc?: string[];
  likes?: ASCollection<string>;
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
