import type { ASActor } from '~~/shared/types/activitypub'

export const useActorAvatar = function () {
  const getAvatarUrl = function (actor: ASActor | undefined): string {
    if (!actor) return ''

    if (actor.icon?.url) {
      return actor.icon.url
    }

    return ''
  }

  return {
    getAvatarUrl
  }
}
