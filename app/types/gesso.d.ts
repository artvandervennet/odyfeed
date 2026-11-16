// Gesso ships plain JavaScript modules without type declarations.
declare module '@vandervennet/gesso'

declare module '@vandervennet/gesso/components/vcard-paint.js' {
  /** Repaints every <solid-vcard-card> in the container, now and when one is added. Returns a stop function. */
  export function paintVcards(container?: HTMLElement): () => void
}
