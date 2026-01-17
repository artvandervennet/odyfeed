import { generateKeyPairSync } from 'crypto'

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
