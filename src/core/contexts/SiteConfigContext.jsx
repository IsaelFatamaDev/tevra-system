import { createContext, useContext, useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
const DEFAULT_TENANT = import.meta.env.VITE_DEFAULT_TENANT_ID || ''

// All null by default — the admin must configure these from Admin > Configuración.
// Nothing is hardcoded. If not configured, components should gracefully hide those elements.
const defaultConfig = {
  // Contact & social — configured from Admin > Configuración > Datos de la empresa
  whatsapp: null,
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  supportEmail: null,
  supportPhone: null,
  name: 'TeVra',
  
  currency: 'USD',
  timezone: 'America/Lima',
  welcomeMessage: '',
  baseShippingRate: 15,
  grossMarginPct: 30,
  agentCommissionPct: 12,
  etcCommissionPct: 3,
  exchangeRateBuy: 3.72,
  exchangeRateSell: 3.78,
  maxAgentZones: 3,
  rawSettings: {},
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
          
          whatsapp: body.whatsapp || null,
          instagramUrl: body.instagramUrl || null,
          facebookUrl: body.facebookUrl || null,
          tiktokUrl: body.tiktokUrl || null,
          supportEmail: body.supportEmail || null,
          supportPhone: body.supportPhone || null,
          name: body.name || 'TeVra',
          
          currency: body.currency || 'USD',
          timezone: body.timezone || 'America/Lima',
          welcomeMessage: body.welcomeMessage || '',
          baseShippingRate: Number(body.baseShippingRate) || 15,
          grossMarginPct: Number(body.grossMarginPct) || 30,
          agentCommissionPct: Number(body.agentCommissionPct) || 12,
          etcCommissionPct: Number(body.etcCommissionPct) || 3,
          exchangeRateBuy: Number(body.exchangeRateBuy) || 3.72,
          exchangeRateSell: Number(body.exchangeRateSell) || 3.78,
          maxAgentZones: Number(body.maxAgentZones) || 3,
          // Raw for custom access
          rawSettings: body,
        })
      })
      .catch(() => { /* keep defaults — admin hasn't configured yet */ })
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
