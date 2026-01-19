import type { ASNote, ASCollection, ASActor } from '~~/shared/types/activitypub'
import { apiHeaders } from '~/utils/fetch'

export const fetchActor = async function (username: string): Promise<ASActor> {
  return await $fetch(`/api/actors/${username}`, {
    headers: apiHeaders,
  })
}

export const fetchActorStatus = async function (username: string, statusId: string): Promise<ASNote> {
  return await $fetch(`/api/actors/${username}/status/${statusId}`, {
    headers: apiHeaders,
  })
}

export const fetchActorOutbox = async function (username: string): Promise<ASCollection<string>> {
  return await $fetch(`/api/actors/${username}/outbox`, {
    headers: apiHeaders,
  })
}

export const fetchActorInbox = async function (username: string): Promise<ASCollection<string>> {
  return await $fetch(`/api/actors/${username}/inbox`, {
    headers: apiHeaders,
  })
}

export const fetchNoteByUrl = async function (url: string): Promise<ASNote> {
  return await $fetch(url, {
    headers: apiHeaders,
  })
}

