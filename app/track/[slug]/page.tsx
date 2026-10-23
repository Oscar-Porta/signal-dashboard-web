'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

/* ── Configuración por slug ────────────────────────────────────────────────── */
const SLUG_CONFIG = {
  'btc-manana-activo':      { franja: 'manana',   umbralVal: 0.45, label: 'Mañana · Activo',        horario: '06h–14h · L–V' },
  'btc-manana-selectivo':   { franja: 'manana',   umbralVal: 0.60, label: 'Mañana · Selectivo',     horario: '06h–14h · L–V' },
  'btc-america-activo':     { franja: 'america',  umbralVal: 0.45, label: 'América · Activo',       horario: '00h–08h · L–V' },
  'btc-america-selectivo':  { franja: 'america',  umbralVal: 0.60, label: 'América · Selectivo',    horario: '00h–08h · L–V' },
  'btc-fulltime-activo':    { franja: 'fulltime', umbralVal: 0.45, label: 'Full Time · Activo',     horario: '24h · todos los días' },
  'btc-fulltime-selectivo': { franja: 'fulltime', umbralVal: 0.60, label: 'Full Time · Selectivo',  horario: '24h · todos los días' },
} as const

type Slug = keyof typeof SLUG_CONFIG

/* ── Tipos ──────────────────────────────────────────────────────────────────── */
interface Signal {
  id: string
  created_at: string
  direction: string
  rule: string
  entry_price: number
  stop_loss: number
  tp1: number
  ai_proba: number | null
  hora_madrid: number
  dia_semana: number
  status: string
  close_price: number | null
  close_reason: string | null
  pnl_usd: number | null
  r_multiple: number | null
  closed_at: string | null
}

/* ── Curva de equity ─────────────────────────────────────────────────────────  */
function EquityCurve({ trades }: { trades: Signal[] }) {
  const closed = trades.filter(t => t.status !== 'open' && t.r_multiple !== null)

  if (closed.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-stone-400 text-sm italic">
        La curva aparecerá cuando cierre el primer trade
      </div>
    )
  }

  let cum = 0
  const points: [number, number][] = [[0, 0]]
  for (const t of closed) { cum += t.r_multiple!; points.push([points.length, cum]) }

  const W = 480, H = 120, pad = 10
  const ys = points.map(p => p[1])
  const minR = Math.min(...ys), maxR = Math.max(...ys)
  const rangeR = maxR - minR || 1
  const n = points.length - 1
  const isPos = cum >= 0
  const color = isPos ? '#f59e0b' : '#ef4444'

  const sx = (i: number) => n === 0 ? pad : pad + (i / n) * (W - 2 * pad)
  const sy = (r: number) => H - pad - ((r - minR) / rangeR) * (H - 2 * pad)

  const polyline = points.map(([i, r]) => `${sx(i)},${sy(r)}`).join(' ')
  const fill = polyline + ` ${sx(n)},${H - pad} ${pad},${H - pad}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {minR < 0 && maxR > 0 && (
        <line x1={pad} x2={W - pad}
          y1={sy(0)} y2={sy(0)}
          stroke="#d6d3d1" strokeWidth="1" strokeDasharray="4,3" />
      )}
      <polygon points={fill} fill="url(#cg)" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Navbar ──────────────────────────────────────────────────────────────────  */
function Navbar() {
  return (
    <nav className="border-b border-stone-100 bg-white">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className="font-bold text-xl tracking-tight text-stone-900">Signal Dashboard</span>
        </Link>
        <Link href="/configurator"
          className="text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors">
          Únete gratis
        </Link>
      </div>
    </nav>
  )
}

/* ── Página principal ────────────────────────────────────────────────────────  */
export default function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: slugRaw } = use(params)
  const slug = slugRaw as Slug
  const cfg = SLUG_CONFIG[slug]

  const [trades, setTrades] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!cfg) return

    async function fetchTrades() {
      setLoading(true)
      try {
        let q = supabase
          .from('signals')
          .select('*')
          .eq('instrument', 'BTC')
          .gte('ai_proba', cfg.umbralVal)
          .order('created_at', { ascending: true })

        if (cfg.franja === 'manana') {
          q = q.gte('hora_madrid', 6).lt('hora_madrid', 14).lte('dia_semana', 4)
        } else if (cfg.franja === 'america') {
          q = q.lt('hora_madrid', 8).lte('dia_semana', 4)
        }
        // fulltime: sin filtro adicional

        const { data, error: err } = await q
        if (err) throw err
        setTrades(data ?? [])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
    const interval = setInterval(fetchTrades, 60_000) // refresco cada minuto
    return () => clearInterval(interval)
  }, [slug])

  if (!cfg) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        Página no encontrada
      </div>
    )
  }

  const closed   = trades.filter(t => t.status !== 'open')
  const open     = trades.find(t => t.status === 'open')
  const wins     = closed.filter(t => t.status === 'win').length
  const wr       = closed.length > 0 ? (wins / closed.length) * 100 : null
  const totalR   = closed.reduce((s, t) => s + (t.r_multiple ?? 0), 0)
  const avgR     = closed.length > 0 ? totalR / closed.length : null

  const fmtDate  = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })
  const fmtPrice = (n: number) => `$${n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Cabecera */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-stone-400 mb-2">
            <Link href="/" className="hover:text-stone-600 transition-colors">Signal Dashboard</Link>
            <span>/</span>
            <span>BTC/USDT</span>
            <span>/</span>
            <span className="text-stone-600">{cfg.label}</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-1">
            BTC/USDT — {cfg.label}
          </h1>
          <p className="text-stone-500 text-sm">
            Historial de señales en vivo · {cfg.horario} · Filtro ML ≥ {cfg.umbralVal === 0.45 ? '0.45 (Activo)' : '0.60 (Selectivo)'}
          </p>
        </div>

        {/* Posición abierta */}
        {open && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="font-semibold text-amber-800 text-sm uppercase tracking-wide">Posición abierta ahora</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-stone-400 mb-0.5">Dirección</div>
                <div className={`font-bold ${open.direction === 'LONG' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {open.direction === 'LONG' ? '▲ LONG' : '▼ SHORT'}
                </div>
              </div>
              <div>
                <div className="text-stone-400 mb-0.5">Entrada</div>
                <div className="font-semibold text-stone-900">{fmtPrice(open.entry_price)}</div>
              </div>
              <div>
                <div className="text-stone-400 mb-0.5">Stop Loss</div>
                <div className="font-semibold text-red-600">{fmtPrice(open.stop_loss)}</div>
              </div>
              <div>
                <div className="text-stone-400 mb-0.5">Take Profit</div>
                <div className="font-semibold text-emerald-600">{fmtPrice(open.tp1)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Trades cerrados', value: loading ? '—' : closed.length.toString() },
            { label: 'Win rate',        value: loading ? '—' : wr !== null ? `${wr.toFixed(1)}%` : '—' },
            { label: 'R total',         value: loading ? '—' : closed.length > 0 ? `${totalR >= 0 ? '+' : ''}${totalR.toFixed(2)}R` : '—' },
            { label: 'R por trade',     value: loading ? '—' : avgR !== null ? `${avgR >= 0 ? '+' : ''}${avgR.toFixed(2)}R` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-stone-100 p-4">
              <div className="text-xs text-stone-400 mb-1">{label}</div>
              <div className="text-2xl font-bold text-stone-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Curva de equity */}
        <div className="bg-white rounded-xl border border-stone-100 p-6 mb-8">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">
            Curva de equity (en R)
          </h2>
          {loading ? (
            <div className="h-28 flex items-center justify-center text-stone-300 text-sm">Cargando…</div>
          ) : (
            <EquityCurve trades={trades} />
          )}
        </div>

        {/* Historial de trades */}
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
              Historial de trades
            </h2>
          </div>

          {loading && (
            <div className="px-6 py-12 text-center text-stone-400 text-sm">Cargando…</div>
          )}

          {error && (
            <div className="px-6 py-12 text-center text-red-400 text-sm">
              Error al cargar los datos. Recarga la página.
            </div>
          )}

          {!loading && !error && closed.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-stone-400 text-sm mb-1">Aún no hay trades cerrados en esta configuración</p>
              <p className="text-stone-300 text-xs">Los resultados aparecerán aquí en tiempo real</p>
            </div>
          )}

          {!loading && !error && closed.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-xs text-stone-400 uppercase tracking-wide">
                    <th className="text-left px-6 py-3">Fecha</th>
                    <th className="text-left px-6 py-3">Dir.</th>
                    <th className="text-right px-6 py-3">Entrada</th>
                    <th className="text-right px-6 py-3">Cierre</th>
                    <th className="text-center px-6 py-3">Resultado</th>
                    <th className="text-right px-6 py-3">R</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {[...closed].reverse().map(t => {
                    const isWin = t.status === 'win'
                    return (
                      <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-3 text-stone-500 whitespace-nowrap">
                          {fmtDate(t.created_at)}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`font-medium ${t.direction === 'LONG' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {t.direction === 'LONG' ? '▲ L' : '▼ S'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-stone-700 font-mono">
                          {fmtPrice(t.entry_price)}
                        </td>
                        <td className="px-6 py-3 text-right text-stone-700 font-mono">
                          {t.close_price ? fmtPrice(t.close_price) : '—'}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            isWin
                              ? 'bg-emerald-50 text-emerald-700'
                              : t.status === 'timeout'
                              ? 'bg-stone-100 text-stone-500'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {t.close_reason === 'TP1' ? 'TP ✓' : t.close_reason === 'SL' ? 'SL ✗' : 'Exp.'}
                          </span>
                        </td>
                        <td className={`px-6 py-3 text-right font-bold font-mono ${
                          (t.r_multiple ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {t.r_multiple !== null
                            ? `${t.r_multiple >= 0 ? '+' : ''}${t.r_multiple.toFixed(2)}R`
                            : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-stone-400 text-center leading-relaxed">
          Resultados reales desde el inicio de producción del sistema (junio 2026). Sin descuento de comisiones (~0.1–0.2% por operación).
          El rendimiento pasado no garantiza resultados futuros. Esta información no es asesoramiento financiero.
        </p>
      </main>
    </div>
  )
}
