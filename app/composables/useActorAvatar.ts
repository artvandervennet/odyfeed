import type { MythActor, ASActor } from '~~/shared/types/activitypub'

export const useActorAvatar = function () {
  const getAvatarUrl = function (actor: MythActor | ASActor | undefined): string {
    if (!actor) return ''

    if ('avatar' in actor && actor.avatar) {
      return actor.avatar
    }

    if ('icon' in actor && actor.icon?.url) {
      return actor.icon.url
    }

    return ''
  }

  return {
    getAvatarUrl
  }
}
