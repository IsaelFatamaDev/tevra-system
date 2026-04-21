import { createContext, useContext, useEffect, useState } from 'react'
import { TEVRA_SUPPORT_WHATSAPP, TEVRA_INSTAGRAM_URL } from '../config/constants'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
const DEFAULT_TENANT = import.meta.env.VITE_DEFAULT_TENANT_ID || ''

const defaultConfig = {
  whatsapp: TEVRA_SUPPORT_WHATSAPP,
  instagramUrl: TEVRA_INSTAGRAM_URL,
  facebookUrl: null,
  tiktokUrl: null,
  supportEmail: null,
  name: 'TeVra',
}

const SiteConfigContext = createContext(defaultConfig)

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig)

  useEffect(() => {
    fetch(`${API_BASE}/tenants/current/public-config`, {
      headers: {
        'Content-Type': 'application/json',
        ...(DEFAULT_TENANT && { 'x-tenant-id': DEFAULT_TENANT }),
      },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        const body = data.data !== undefined ? data.data : data
        setConfig({
          whatsapp: body.whatsapp || TEVRA_SUPPORT_WHATSAPP,
          instagramUrl: body.instagramUrl || TEVRA_INSTAGRAM_URL,
          facebookUrl: body.facebookUrl || null,
          tiktokUrl: body.tiktokUrl || null,
          supportEmail: body.supportEmail || null,
          name: body.name || 'TeVra',
        })
      })
      .catch(() => { /* keep defaults */ })
  }, [])

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  return useContext(SiteConfigContext)
}

export default SiteConfigContext
