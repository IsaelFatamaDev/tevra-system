/**
 * LibreTranslate integration for dynamic content translation.
 * Self-hosted instance should be set in VITE_LIBRETRANSLATE_URL.
 * Falls back to the public demo instance (rate-limited).
 *
 * Usage:
 *   import translateService from './translate.service'
 *   const translated = await translateService.translate('Hello world', 'en', 'es')
 */

const BASE_URL = import.meta.env.VITE_LIBRETRANSLATE_URL || 'https://libretranslate.com'
const API_KEY  = import.meta.env.VITE_LIBRETRANSLATE_KEY || ''

// In-memory cache: { "text|source|target" -> translatedText }
const cache = new Map()

async function translate(text, source = 'auto', target = 'es') {
  if (!text || typeof text !== 'string' || text.trim() === '') return text
  if (source === target) return text

  const cacheKey = `${text}|${source}|${target}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  try {
    const body = { q: text, source, target, format: 'text' }
    if (API_KEY) body.api_key = API_KEY

    const res = await fetch(`${BASE_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error(`LibreTranslate error: ${res.status}`)
    const data = await res.json()
    const result = data.translatedText || text
    cache.set(cacheKey, result)
    return result
  } catch {
    return text
  }
}

/**
 * Translate multiple texts in one batch request.
 * Returns array of translated strings in same order.
 */
async function translateBatch(texts, source = 'auto', target = 'es') {
  return Promise.all(texts.map(t => translate(t, source, target)))
}

/**
 * Detect language of a text.
 * Returns: [{ language: 'es', confidence: 0.99 }, ...]
 */
async function detect(text) {
  try {
    const body = { q: text }
    if (API_KEY) body.api_key = API_KEY
    const res = await fetch(`${BASE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Detect failed')
    return await res.json()
  } catch {
    return []
  }
}

/**
 * Get list of supported languages from the LibreTranslate instance.
 */
async function getSupportedLanguages() {
  try {
    const res = await fetch(`${BASE_URL}/languages`)
    if (!res.ok) throw new Error('Failed to fetch languages')
    return await res.json()
  } catch {
    return [
      { code: 'es', name: 'Spanish' },
      { code: 'en', name: 'English' },
    ]
  }
}

const translateService = { translate, translateBatch, detect, getSupportedLanguages }
export default translateService
