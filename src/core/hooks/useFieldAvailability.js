import { useState, useEffect, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
const DEFAULT_TENANT = import.meta.env.VITE_DEFAULT_TENANT_ID || ''

function getTenantId() {
  try {
    const stored = sessionStorage.getItem('tevra_user')
    if (stored) {
      const user = JSON.parse(stored)
      if (user?.tenantId) return user.tenantId
    }
  } catch {}
  return DEFAULT_TENANT
}

export function useFieldAvailability(fields, excludeUserId = null, debounceMs = 600) {
  const [errors, setErrors] = useState({})
  const [checking, setChecking] = useState({})
  const timerRef = useRef(null)

  useEffect(() => {
    const params = {}
    if (fields.email?.trim()) params.email = fields.email.trim()
    if (fields.phone?.trim()) params.phone = fields.phone.trim()
    if (fields.whatsapp?.trim()) params.whatsapp = fields.whatsapp.trim()

    if (Object.keys(params).length === 0) {
      setErrors({})
      return
    }

    clearTimeout(timerRef.current)
    setChecking(Object.fromEntries(Object.keys(params).map(k => [k, true])))

    timerRef.current = setTimeout(async () => {
      try {
        const tenantId = getTenantId()
        const qs = new URLSearchParams(params)
        if (excludeUserId) qs.set('excludeUserId', excludeUserId)
        const res = await fetch(`${API_BASE}/auth/check-availability?${qs}`, {
          headers: { 'x-tenant-id': tenantId },
        })
        const body = await res.json()
        // API wraps field errors inside body.data; top-level keys (success, timestamp) are not errors
        const fieldErrors = (body && typeof body.data === 'object' && body.data !== null) ? body.data : {}
        setErrors(fieldErrors)
      } catch {}
      setChecking({})
    }, debounceMs)

    return () => clearTimeout(timerRef.current)
  }, [fields.email, fields.phone, fields.whatsapp, excludeUserId])

  return { availabilityErrors: errors, checking }
}
