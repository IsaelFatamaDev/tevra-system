/**
 * Hook to translate dynamic content (from backend/API) using LibreTranslate.
 * Use this for product descriptions, names, or any user-generated content
 * that is NOT covered by static i18n keys.
 *
 * Example:
 *   const translatedDesc = useTranslateContent(product.description, 'es')
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import translateService from '../services/translate.service'

export function useTranslateContent(text, sourceLanguage = 'es') {
  const { i18n } = useTranslation()
  const targetLang = i18n.language?.startsWith('en') ? 'en' : 'es'
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    if (!text || sourceLanguage === targetLang) {
      setTranslated(text)
      return
    }
    let cancelled = false
    translateService.translate(text, sourceLanguage, targetLang)
      .then(result => { if (!cancelled) setTranslated(result) })
    return () => { cancelled = true }
  }, [text, sourceLanguage, targetLang])

  return translated
}

/**
 * Hook to translate multiple strings at once.
 * Returns array of translated strings.
 */
export function useTranslateMany(texts, sourceLanguage = 'es') {
  const { i18n } = useTranslation()
  const targetLang = i18n.language?.startsWith('en') ? 'en' : 'es'
  const [translated, setTranslated] = useState(texts)

  useEffect(() => {
    if (!texts?.length || sourceLanguage === targetLang) {
      setTranslated(texts)
      return
    }
    let cancelled = false
    translateService.translateBatch(texts, sourceLanguage, targetLang)
      .then(results => { if (!cancelled) setTranslated(results) })
    return () => { cancelled = true }
  }, [JSON.stringify(texts), sourceLanguage, targetLang])

  return translated
}
