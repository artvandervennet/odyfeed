import { DEFAULTS } from "~~/shared/constants"

export default defineEventHandler((event) => {
  const baseUrl = process.env.BASE_URL || DEFAULTS.BASE_URL

  setResponseHeader(event, 'Content-Type', 'application/xrd+xml; charset=utf-8')
  setResponseHeader(event, 'Access-Control-Allow-Origin', '*')

  return `<?xml version="1.0" encoding="UTF-8"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
  <Link rel="lrdd" template="${baseUrl}/.well-known/webfinger?resource={uri}" />
</XRD>`
})
