const encoder = new TextEncoder()
const decoder = new TextDecoder()

const toBase64 = bytes => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const fromBase64 = value => {
  const binary = atob(value)
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

export const randomSalt = () => crypto.getRandomValues(new Uint8Array(16))

export async function deriveVaultKey(pin, salt) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptVault(value, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(value)))
  return JSON.stringify({ version: 1, iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(encrypted)) })
}

export async function decryptVault(payload, key) {
  const parsed = JSON.parse(payload)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(parsed.iv) }, key, fromBase64(parsed.ciphertext))
  return JSON.parse(decoder.decode(decrypted))
}

export const encodeSalt = toBase64
export const decodeSalt = fromBase64
