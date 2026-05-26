


import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function VerificadoPage() {
  const [params] = useSearchParams()
  const status = params.get('status') 
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(t)
  }, [])

  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className={`bg-white rounded-[2.5rem] shadow-[0_24px_80px_rgba(0,0,0,0.08)] border border-slate-100 p-12 max-w-md w-full text-center transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {}
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg ${isSuccess ? 'bg-emerald-50 border-2 border-emerald-100' : 'bg-red-50 border-2 border-red-100'}`}>
          <span className={`material-symbols-outlined text-5xl ${isSuccess ? 'text-emerald-500' : 'text-red-400'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}>
            {isSuccess ? 'verified' : 'error'}
          </span>
        </div>

        {}
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-6">TeVra</p>

        {}
        <h1 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          {isSuccess ? '¡Cuenta verificada!' : 'Error de verificación'}
        </h1>

        <p className="text-slate-500 leading-relaxed mb-8">
          {isSuccess
            ? 'Tu correo ha sido confirmado exitosamente. Ya puedes iniciar sesión y empezar a usar tu cuenta.'
            : 'El enlace de verificación es inválido o ya expiró. Puedes solicitar uno nuevo iniciando sesión.'}
        </p>

        {}
        <Link to="/login"
          className="w-full inline-flex items-center justify-center gap-2 py-4 px-8 bg-slate-900 hover:bg-slate-800 text-[#EEF4ED] font-bold rounded-2xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 text-sm">
          <span className="material-symbols-outlined text-[20px]">login</span>
          Iniciar sesión
        </Link>

        {!isSuccess && (
          <Link to="/" className="mt-4 inline-block text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors">
            Volver al inicio
          </Link>
        )}
      </div>
    </div>
  )
}
