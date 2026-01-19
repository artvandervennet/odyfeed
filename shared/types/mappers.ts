import type { ASNote, ASActor, EnrichedPost } from './activitypub'
import type { UserProfileResponse } from './api'

export const transformActorToProfile = function (actor: ASActor): UserProfileResponse {
  return {
    preferredUsername: actor.preferredUsername,
    name: actor.name,
    avatar: actor.icon?.url,
    summary: actor.summary,
  }
}

export const enrichNoteWithActor = function (note: ASNote, actor: ASActor): EnrichedPost {
  return {
    ...note,
    actor,
  }
}

export const enrichNotesWithActors = async function (
  notes: ASNote[],
  fetchActor: (url: string) => Promise<ASActor>
): Promise<EnrichedPost[]> {
  return await Promise.all(
    notes.map(async (note) => {
      const actorUrl = note.attributedTo
      const actor = await fetchActor(actorUrl)
      return enrichNoteWithActor(note, actor)
    })
  )
}

export const extractUsernameFromActorUrl = function (actorUrl: string): string {
  return actorUrl.split('/').pop() || ''
}

export const extractCollectionItems = function <T>(
  collection: { orderedItems?: T[]; items?: T[] } | undefined
): T[] {
  if (!collection) return []
  return collection.orderedItems || collection.items || []
}
