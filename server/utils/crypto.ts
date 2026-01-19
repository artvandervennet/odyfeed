import { generateKeyPairSync, createSign, createHash, randomUUID } from 'crypto'

export interface KeyPair {
  publicKey: string
  privateKey: string
}

export const generateActorKeyPair = function (): KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })

  return {
    publicKey,
    privateKey,
  }
}

export interface SignRequestParams {
  privateKey: string
  keyId: string
  url: string
  method: string
  body?: string
}

export const signRequest = function (params: SignRequestParams): Record<string, string> {
  const { privateKey, keyId, url, method, body } = params
  const urlObj = new URL(url)
  const host = urlObj.host
  const path = urlObj.pathname + urlObj.search
  const date = new Date().toUTCString()

  let stringToSign = `(request-target): ${method.toLowerCase()} ${path}\nhost: ${host}\ndate: ${date}`
  let headers = '(request-target) host date'

  if (body) {
    const digest = `SHA-256=${createHash('sha256').update(body).digest('base64')}`
    stringToSign += `\ndigest: ${digest}`
    headers += ' digest'
  }

  const signer = createSign('sha256')
  signer.update(stringToSign)
  signer.end()

  const signature = signer.sign(privateKey, 'base64')
  const signatureHeader = `keyId="${keyId}",algorithm="rsa-sha256",headers="${headers}",signature="${signature}"`

  const requestHeaders: Record<string, string> = {
    'Host': host,
    'Date': date,
    'Signature': signatureHeader,
  }

  if (body) {
    requestHeaders['Digest'] = `SHA-256=${createHash('sha256').update(body).digest('base64')}`
  }

  return requestHeaders
}

export const generateUUID = function (): string {
  return randomUUID()
}

