'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  METRICS, CHANNEL_LINKS, FRANJA_LABELS, UMBRAL_LABELS,
  type Instrument, type Franja, type Umbral,
} from '@/lib/channels'
import { supabase } from '@/lib/supabase'

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className="font-bold text-xl tracking-tight text-stone-900">Signal Dashboard</span>
        </Link>
        <Link href="/how-it-works" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
          ¿Cómo funciona?
        </Link>
      </div>
    </nav>
  )
}

// ── Barra de progreso ────────────────────────────────────────────────────────
const STEPS = ['Mercado', 'Franja', 'Filtro', 'Acceso']

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              i < current  ? 'bg-amber-500 text-white' :
              i === current ? 'bg-amber-500 text-white ring-4 ring-amber-100' :
                             'bg-stone-100 text-stone-400'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i === current ? 'text-amber-600' : 'text-stone-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 h-0.5 mb-4 transition-all duration-300 ${i < current ? 'bg-amber-500' : 'bg-stone-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Tarjeta de selección genérica ────────────────────────────────────────────
function SelectCard({
  selected, disabled, onClick, children,
}: {
  selected: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left rounded-2xl border-2 p-6 transition-all duration-200 ${
        disabled  ? 'border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed' :
        selected  ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100' :
                    'border-stone-200 bg-white hover:border-amber-300 hover:shadow-sm'
      }`}
    >
      {children}
    </button>
  )
}

// ── Paso 1 — Instrumento ────────────────────────────────────────────────────
function StepInstrument({ onSelect }: { onSelect: (i: Instrument) => void }) {
  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out both' }}>
      <h2 className="text-3xl font-bold text-stone-900 text-center mb-2">¿Qué mercado quieres seguir?</h2>
      <p className="text-stone-500 text-center mb-8">Elige el activo para el que recibirás señales.</p>
      <div className="grid gap-4 max-w-lg mx-auto">
        <SelectCard selected={false} onClick={() => onSelect('BTC')}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-900 text-lg">Bitcoin · BTC/USDT</div>
              <div className="text-stone-500 text-sm mt-1">Señales en velas de 1 hora · Binance Spot</div>
            </div>
            <div className="text-3xl">₿</div>
          </div>
          <div className="mt-4 flex gap-3">
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Activo</span>
            <span className="bg-stone-100 text-stone-600 text-xs px-2.5 py-1 rounded-full">5 años de histórico</span>
          </div>
        </SelectCard>

        <SelectCard selected={false} disabled onClick={() => {}}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-400 text-lg">Ethereum · ETH/USDT</div>
              <div className="text-stone-400 text-sm mt-1">En desarrollo</div>
            </div>
            <div className="text-3xl opacity-30">Ξ</div>
          </div>
          <div className="mt-4">
            <span className="bg-stone-100 text-stone-400 text-xs font-semibold px-2.5 py-1 rounded-full">Próximamente</span>
          </div>
        </SelectCard>

        <SelectCard selected={false} disabled onClick={() => {}}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-400 text-lg">Solana · SOL/USDT</div>
              <div className="text-stone-400 text-sm mt-1">En desarrollo</div>
            </div>
            <div className="text-3xl opacity-30">◎</div>
          </div>
          <div className="mt-4">
            <span className="bg-stone-100 text-stone-400 text-xs font-semibold px-2.5 py-1 rounded-full">Próximamente</span>
          </div>
        </SelectCard>
      </div>
    </div>
  )
}

// ── Paso 2 — Franja ─────────────────────────────────────────────────────────
function StepFranja({
  instrument, selected, onSelect, onBack,
}: {
  instrument: Instrument; selected: Franja | null;
  onSelect: (f: Franja) => void; onBack: () => void;
}) {
  // Validación live (jul-2026): solo el canal Full Time (24h) está
  // activo. Las franjas Mañana/América se reactivarán cuando haya
  // datos live suficientes por franja y canales dedicados.
  const franjas: Franja[] = ['fulltime']

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out both' }}>
      <h2 className="text-3xl font-bold text-stone-900 text-center mb-2">Cobertura de las señales</h2>
      <p className="text-stone-500 text-center mb-8">Durante la validación, las señales se emiten a jornada completa (24h, todos los días).</p>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {franjas.map(f => {
          const label = FRANJA_LABELS[f]
          const mSel    = METRICS[instrument][f].selectivo
          return (
            <SelectCard key={f} selected={selected === f} onClick={() => onSelect(f)}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="font-bold text-stone-900 text-lg mb-1">{label.name}</div>
                  <div className="text-amber-600 font-semibold text-sm">{label.hours}</div>
                  <div className="text-stone-400 text-xs mt-0.5">{label.latam}</div>
                  <div className="text-stone-500 text-sm mt-2">{label.desc}</div>
                </div>
                <div className="flex gap-4 text-right flex-shrink-0">
                  <div>
                    <div className="text-lg font-bold text-stone-900">{mSel.freq}</div>
                    <div className="text-xs text-stone-400">señales/sem</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{mSel.wr}%</div>
                    <div className="text-xs text-stone-400">Win Rate</div>
                  </div>
                </div>
              </div>
            </SelectCard>
          )
        })}
      </div>

      <div className="flex justify-center mt-8">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
          ← Volver
        </button>
      </div>
    </div>
  )
}

// ── Paso 3 — Umbral ─────────────────────────────────────────────────────────
function StepUmbral({
  instrument, franja, selected, onSelect, onBack,
}: {
  instrument: Instrument; franja: Franja; selected: Umbral | null;
  onSelect: (u: Umbral) => void; onBack: () => void;
}) {
  // Validación live (jul-2026): solo se ofrece Selectivo (el único con
  // respaldo walk-forward). Activo retirado hasta acumular datos live.
  const umbrales: Umbral[] = ['selectivo']

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out both' }}>
      <h2 className="text-3xl font-bold text-stone-900 text-center mb-2">¿Qué nivel de filtro prefieres?</h2>
      <p className="text-stone-500 text-center mb-8">
        El filtro decide qué señales pasan. Más filtro = menos señales, más precisión.
      </p>

      {/* Comparativa rápida */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 max-w-2xl mx-auto mb-5 text-sm text-stone-600">
        <span className="font-semibold text-amber-700">Nivel Selectivo</span> — durante la fase de validación en vivo ofrecemos únicamente el filtro más exigente (umbral 0.60), el único con respaldo estadístico en la validación walk-forward. Añadiremos más niveles cuando los datos en directo lo confirmen.
      </div>

      <div className="grid gap-5 max-w-md mx-auto">
        {umbrales.map(u => {
          const label = UMBRAL_LABELS[u]
          const m     = METRICS[instrument][franja][u]
          const isActivo = u === 'activo'
          return (
            <SelectCard key={u} selected={selected === u} onClick={() => onSelect(u)}>
              <div className="flex items-start justify-between mb-1">
                <div className="font-bold text-stone-900 text-xl">{label.name}</div>
                {isActivo
                  ? <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">Mayor PnL total</span>
                  : <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">Máxima precisión</span>
                }
              </div>
              <div className="text-stone-400 text-xs font-mono mb-3">Umbral {label.value}</div>
              <p className="text-stone-500 text-sm mb-5">{label.desc}</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'PnL total',   value: `+$${m.pnl.toLocaleString('es-ES')}`,      color: isActivo ? 'text-blue-600 font-extrabold' : 'text-green-600' },
                  { label: 'Win Rate',    value: `${m.wr}%`,                                 color: 'text-green-600' },
                  { label: 'Señales/sem', value: `${m.freq}`,                                color: 'text-amber-500' },
                  { label: 'PnL/trade',  value: `+$${m.pnlTrade.toLocaleString('es-ES')}`,  color: 'text-stone-700' },
                  { label: 'Max DD',     value: `$${m.maxdd.toLocaleString('es-ES')}`,       color: 'text-rose-500' },
                  { label: 'Profit Factor', value: `${m.pf}`,                                color: 'text-indigo-600' },
                ].map(stat => (
                  <div key={stat.label} className="bg-stone-50 rounded-xl p-3 text-center">
                    <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-stone-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-stone-400 text-center">
                {m.signals} operaciones · walk-forward out-of-sample 2023–2026 · neto de comisiones
              </div>
            </SelectCard>
          )
        })}
      </div>

      <div className="flex justify-center mt-8">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
          ← Volver
        </button>
      </div>
    </div>
  )
}

// ── Paso 4 — Formulario ─────────────────────────────────────────────────────
function StepForm({
  instrument, franja, umbral, onSubmit, onBack, isLoading, submitError,
}: {
  instrument: Instrument; franja: Franja; umbral: Umbral;
  onSubmit: (email: string, telegram: string) => void; onBack: () => void;
  isLoading?: boolean; submitError?: string;
}) {
  const [email,    setEmail]    = useState('')
  const [telegram, setTelegram] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [errors,   setErrors]   = useState<Record<string, string>>({})

  const fLabel = FRANJA_LABELS[franja]
  const uLabel = UMBRAL_LABELS[umbral]

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email.includes('@'))      e.email    = 'Introduce un email válido'
    if (!telegram.startsWith('@')) e.telegram = 'El handle debe empezar por @'
    if (!accepted)                 e.terms    = 'Debes aceptar los términos'
    return e
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    onSubmit(email, telegram)
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out both' }}>
      <h2 className="text-3xl font-bold text-stone-900 text-center mb-2">Completa tu registro</h2>
      <p className="text-stone-500 text-center mb-8">Acceso gratuito. Sin tarjeta de crédito.</p>

      {/* Resumen de selección */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8 max-w-lg mx-auto">
        <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">Tu configuración</div>
        <div className="flex flex-wrap gap-2">
          <span className="bg-white border border-amber-200 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
            {instrument}
          </span>
          <span className="bg-white border border-amber-200 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
            {fLabel.name} · {fLabel.hours}
          </span>
          <span className="bg-white border border-amber-200 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
            {uLabel.name}
          </span>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className={`w-full border rounded-xl px-4 py-3 text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-stone-200 bg-white'
            }`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Telegram */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Handle de Telegram
            <span className="text-stone-400 font-normal ml-1">— para enviarte las señales</span>
          </label>
          <input
            type="text"
            value={telegram}
            onChange={e => setTelegram(e.target.value)}
            placeholder="@tu_usuario"
            className={`w-full border rounded-xl px-4 py-3 text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
              errors.telegram ? 'border-red-300 bg-red-50' : 'border-stone-200 bg-white'
            }`}
          />
          {errors.telegram && <p className="text-red-500 text-xs mt-1">{errors.telegram}</p>}
          <p className="text-stone-400 text-xs mt-1">
            Necesitas un <strong>nombre de usuario</strong> de Telegram (no tu número de teléfono).
            Si no tienes uno: Telegram → Ajustes → Tu perfil → Nombre de usuario → Crear uno.
          </p>
        </div>

        {/* GDPR */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              className="mt-0.5 accent-amber-500 w-4 h-4 flex-shrink-0"
            />
            <span className="text-sm text-stone-500 leading-relaxed">
              Acepto recibir señales de trading por Telegram y entiendo que los resultados
              históricos no garantizan rendimientos futuros. Los datos se tratan conforme al RGPD.
            </span>
          </label>
          {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
        </div>

        {/* Error de servidor */}
        {submitError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
            {submitError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full text-lg transition-all duration-200 shadow-lg shadow-amber-200 hover:shadow-amber-300 hover:-translate-y-0.5"
        >
          {isLoading ? 'Guardando...' : 'Acceder al canal →'}
        </button>
      </form>

      <div className="flex justify-center mt-6">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
          ← Volver
        </button>
      </div>
    </div>
  )
}

// ── Paso 5 — Éxito ──────────────────────────────────────────────────────────
function StepSuccess({
  instrument, franja, umbral, inviteLink,
}: {
  instrument: Instrument; franja: Franja; umbral: Umbral; inviteLink: string;
}) {
  const fLabel = FRANJA_LABELS[franja]
  const uLabel = UMBRAL_LABELS[umbral]
  const m      = METRICS[instrument][franja][umbral]

  return (
    <div className="text-center" style={{ animation: 'fadeInUp 0.4s ease-out both' }}>
      {/* Checkmark */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-stone-900 mb-3">¡Todo listo!</h2>
      <p className="text-stone-500 text-lg mb-8 max-w-md mx-auto">
        Tu canal está preparado. Únete ahora para empezar a recibir señales.
      </p>

      {/* Resumen */}
      <div className="bg-stone-50 rounded-2xl p-6 max-w-sm mx-auto mb-8 text-left">
        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Tu configuración</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Instrumento</span>
            <span className="font-semibold text-stone-900">{instrument}/USDT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Franja</span>
            <span className="font-semibold text-stone-900">{fLabel.name} · {fLabel.hours}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Nivel de filtro</span>
            <span className="font-semibold text-stone-900">{uLabel.name} ({uLabel.value})</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-stone-200">
            <span className="text-stone-500">Win Rate histórico</span>
            <span className="font-bold text-green-600">{m.wr}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Frecuencia</span>
            <span className="font-semibold text-stone-900">{m.freq} señales/semana</span>
          </div>
        </div>
      </div>

      {/* CTA principal */}
      <a
        href={inviteLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white font-bold px-9 py-4 rounded-full text-lg transition-all duration-200 shadow-xl shadow-amber-200 hover:shadow-amber-300 hover:-translate-y-0.5 mb-4"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.69 7.96c-.13.59-.47.73-.95.46l-2.62-1.93-1.27 1.22c-.14.14-.26.26-.53.26l.19-2.72 4.93-4.46c.21-.19-.05-.3-.33-.11l-6.1 3.84-2.62-.82c-.57-.18-.58-.57.12-.84l10.2-3.93c.47-.18.88.11.73.84-.01 0-.01 0 0 0h-.06z"/>
        </svg>
        Unirme al canal de Telegram
      </a>

      <div className="text-stone-400 text-sm mb-10">
        Guarda este enlace — es tu acceso personal al canal.
      </div>

      <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
        ← Volver al inicio
      </Link>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function Configurator() {
  const [step,        setStep]        = useState(0)
  const [instrument,  setInstrument]  = useState<Instrument | null>(null)
  const [franja,      setFranja]      = useState<Franja     | null>(null)
  const [umbral,      setUmbral]      = useState<Umbral     | null>(null)
  const [inviteLink,  setInviteLink]  = useState('')
  const [isLoading,   setIsLoading]   = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleInstrument = (i: Instrument) => { setInstrument(i); setStep(1) }
  const handleFranja     = (f: Franja)     => { setFranja(f);     setStep(2) }
  const handleUmbral     = (u: Umbral)     => { setUmbral(u);     setStep(3) }

  const handleSubmit = async (email: string, telegram: string) => {
    setIsLoading(true)
    setSubmitError('')

    const { error } = await supabase.from('subscriptions').insert({
      email,
      telegram_username: telegram,
      instrument:        instrument!,
      franja:            franja!,
      umbral:            umbral!,
      gdpr_consent:      true,
    })

    setIsLoading(false)

    if (error) {
      console.error('Supabase error:', error)
      setSubmitError('Ha ocurrido un error al guardar tu registro. Por favor, inténtalo de nuevo.')
      return
    }

    const link = CHANNEL_LINKS[instrument!][franja!][umbral!]
    setInviteLink(link)
    setStep(4)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Título de sección */}
          {step < 4 && (
            <div className="text-center mb-8">
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">
                Configurador
              </div>
              <ProgressBar current={step} />
            </div>
          )}

          {/* Pasos */}
          {step === 0 && (
            <StepInstrument onSelect={handleInstrument} />
          )}
          {step === 1 && instrument && (
            <StepFranja
              instrument={instrument}
              selected={franja}
              onSelect={handleFranja}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && instrument && franja && (
            <StepUmbral
              instrument={instrument}
              franja={franja}
              selected={umbral}
              onSelect={handleUmbral}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && instrument && franja && umbral && (
            <StepForm
              instrument={instrument}
              franja={franja}
              umbral={umbral}
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
              isLoading={isLoading}
              submitError={submitError}
            />
          )}
          {step === 4 && instrument && franja && umbral && (
            <StepSuccess
              instrument={instrument}
              franja={franja}
              umbral={umbral}
              inviteLink={inviteLink}
            />
          )}
        </div>
      </main>
    </>
  )
}
