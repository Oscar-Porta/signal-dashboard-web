'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/* ── Datos HONESTOS para la calculadora ────────────────────────────────────
   Fuente: validación walk-forward out-of-sample 2023-2026 (cada señal
   predicha por un modelo entrenado SOLO con datos anteriores a ella),
   ejecución con orden limit, PnL NETO de comisiones.
   Base: $10.000 por posición arriesgando 1% ($100) por operación.
   Los números anteriores (WR 63-96%) provenían de un modelo con un
   error de alineación temporal corregido el 3-jul-2026 — no eran
   reproducibles en real y se retiraron.                                    */
const CALC_DATA = {
  manana_activo:     { signals: 115, wr: 47.0, pnl: 2686,  pnlTrade: 23,  maxdd: -2143, freq: 0.7 },
  manana_selectivo:  { signals: 28,  wr: 60.7, pnl: 1694,  pnlTrade: 61,  maxdd: -444,  freq: 0.2 },
  america_activo:    { signals: 149, wr: 40.9, pnl: 1416,  pnlTrade: 10,  maxdd: -2107, freq: 0.9 },
  america_selectivo: { signals: 36,  wr: 44.4, pnl: 658,   pnlTrade: 18,  maxdd: -613,  freq: 0.2 },
  fulltime_activo:   { signals: 580, wr: 38.4, pnl: -1072, pnlTrade: -2,  maxdd: -3703, freq: 3.4 },
  fulltime_selectivo:{ signals: 150, wr: 42.7, pnl: 1469,  pnlTrade: 10,  maxdd: -1514, freq: 0.9 },
} as const

type ConfigKey = keyof typeof CALC_DATA

// Decisión de producto (4-jul-2026): durante la validación live solo se
// ofrece el nivel SELECTIVO (0.60), el único con respaldo estadístico.
// El nivel Activo (0.45) queda retirado temporalmente (PF 0.97 a
// jornada completa con métricas honestas) hasta que el modelo pooled
// o los datos live lo rehabiliten.
const CALC_CONFIGS: { key: ConfigKey; label: string; note: string }[] = [
  { key: 'fulltime_selectivo',label: 'Full Time · Selectivo',note: '0.9 señales/sem' },
]

/* ── Equity curve data (viewBox 480 × 240) ─────────────────────────────────
   y: coordenada SVG (invertida — valores bajos = equity alta en pantalla)   */
// Curva REAL: equity acumulada (en R) del walk-forward out-of-sample
// 2023-2026, umbral Selectivo (0.60), ejecución limit, PnL neto.
// Generada desde outputs/experiments/walkforward_1h_limit.csv — no
// es una ilustración. Incluye el drawdown real de mediados de 2023.
const CURVE_PTS = [
  [0, 148], [12, 162], [23, 170], [35, 154], [47, 178], [59, 204],
  [70, 222], [82, 213], [94, 221], [105, 206], [117, 163], [129, 136],
  [140, 155], [152, 130], [164, 140], [176, 126], [187, 121], [199, 133],
  [211, 117], [222, 108], [234, 117], [246, 101], [258, 86], [269, 72],
  [281, 74], [293, 98], [304, 98], [316, 99], [328, 90], [340, 88],
  [351, 83], [363, 67], [375, 76], [386, 77], [398, 80], [410, 63],
  [421, 65], [433, 57], [445, 32], [457, 51], [468, 59], [480, 66],
].map(([x, y]) => `${x},${y}`).join(' ')

const FILL_PTS = CURVE_PTS + ' 480,240 0,240'

/* ── Navbar ─────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className="font-bold text-xl tracking-tight text-stone-900">
            Signal Dashboard
          </span>
        </div>

        {/* Links (escritorio) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-500">
          <Link href="/how-it-works" className="hover:text-stone-900 transition-colors">
            Cómo funciona
          </Link>
          <Link href="/how-it-works#sistema" className="hover:text-stone-900 transition-colors">
            El sistema
          </Link>
        </div>

        {/* CTA */}
        <Link
          href="/configurator"
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Configurar →
        </Link>
      </div>
    </nav>
  )
}

/* ── Equity chart ───────────────────────────────────────────────────────── */
function EquityChart() {
  return (
    <div
      className="relative w-full"
      style={{ animation: 'revealChart 2s ease-out 0.4s both' }}
    >
      <svg viewBox="0 0 480 240" className="w-full h-auto">
        <defs>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.01" />
          </linearGradient>
          <pattern id="grid" width="48" height="40" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 40" fill="none" stroke="#E7E5E4" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Grid de fondo */}
        <rect width="480" height="240" fill="url(#grid)" />

        {/* Área de relleno bajo la curva */}
        <polygon points={FILL_PTS} fill="url(#fillGrad)" />

        {/* Línea de la curva */}
        <polyline
          points={CURVE_PTS}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Punto final pulsante */}
        <circle cx="480" cy="66" r="5" fill="#F59E0B" />
        <circle cx="480" cy="66" r="10" fill="#F59E0B" opacity="0.25" className="animate-ping" />
      </svg>

      {/* Etiquetas eje Y (en unidades de riesgo R) */}
      <div className="absolute right-1 inset-y-0 flex flex-col justify-between py-2 text-xs font-mono text-stone-400 pointer-events-none">
        <span>+20R</span>
        <span>+8R</span>
        <span>-4R</span>
      </div>

      {/* Etiquetas eje X */}
      <div className="absolute bottom-0 inset-x-0 flex justify-between px-1 text-xs text-stone-400 pointer-events-none">
        <span>Ene &apos;23</span>
        <span>Sep &apos;24</span>
        <span>Mar &apos;26</span>
      </div>
    </div>
  )
}

/* ── Tarjeta de señal en vivo ───────────────────────────────────────────── */
function SignalCard() {
  return (
    <div
      className="bg-white rounded-2xl shadow-xl border border-stone-100 p-4 w-60"
      style={{ animation: 'slideInRight 0.7s ease-out 2.2s both' }}
    >
      {/* Cabecera */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Nueva señal · 2 min
        </span>
      </div>

      <div className="font-bold text-stone-900 text-base mb-3">LONG BTC/USDT</div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-stone-400">Orden limit (1h)</span>
          <span className="font-mono font-semibold text-stone-900">$109.450</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Stop Loss</span>
          <span className="font-mono text-red-500">$108.082 <span className="text-stone-300">-1.25%</span></span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Take Profit</span>
          <span className="font-mono text-green-600">$111.853 <span className="text-stone-300">+2.5%</span></span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          Activo · 0.68
        </span>
        <span className="text-xs text-stone-400">Mañana</span>
      </div>
    </div>
  )
}

/* ── Hero ───────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-28 px-6">
      {/* Fondo con degradado sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-amber-50/60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-100/25 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* ── Columna izquierda ── */}
        <div style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            BTC/USDT · Sistema algorítmico activo
          </div>

          {/* Titular */}
          <h1 className="text-5xl font-bold text-stone-900 tracking-tight leading-[1.1] mb-6">
            Señales de trading.<br />
            <span className="text-amber-500">Alta precisión.</span><br />
            Tu horario.
          </h1>

          {/* Subtítulo */}
          <p className="text-lg text-stone-500 leading-relaxed mb-8 max-w-md">
            Un motor algorítmico analiza BTC/USDT cada hora. Solo cuando la
            probabilidad supera tu umbral, la señal llega directo a tu Telegram.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-5 mb-12 flex-wrap">
            <Link
              href="/configurator"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-amber-200 hover:shadow-amber-300 hover:-translate-y-0.5"
            >
              Configurar mis señales →
            </Link>
            <Link
              href="/how-it-works"
              className="text-stone-500 hover:text-stone-900 font-medium transition-colors"
            >
              Cómo funciona ↓
            </Link>
          </div>

          {/* Mini stats */}
          <div className="flex items-center gap-10">
            {[
              { value: '3 años',  label: 'Validación walk-forward', note: 'out-of-sample, 2023-26' },
              { value: '+0.10R',  label: 'Media neta por señal',    note: 'umbral Selectivo'       },
              { value: '100%',    label: 'Historial auditable',     note: 'cada señal, en /track'  },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-stone-900">{s.value}</div>
                <div className="text-xs font-medium text-stone-500">{s.label}</div>
                <div className="text-xs text-stone-300">{s.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Columna derecha ── */}
        <div className="relative">
          {/* Tarjeta del gráfico */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-xl p-6 overflow-visible">
            {/* Cabecera del gráfico */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-sm font-semibold text-stone-900">
                  Equity walk-forward · Selectivo
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  2023 – 2026 · out-of-sample · comisiones incluidas
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">+14.7R</div>
                <div className="text-xs text-stone-400">150 señales · WR 42.7%</div>
              </div>
            </div>

            <EquityChart />
          </div>

          {/* Tarjeta de señal flotante */}
          <div className="absolute -bottom-8 -left-8 z-10">
            <SignalCard />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Cómo funciona ──────────────────────────────────────────────────────── */
function HowItWorksSection() {
  const steps = [
    {
      n: '01',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      title: 'El mercado, analizado 24/7',
      body:  'Datos en tiempo real de Binance. Indicadores técnicos, volatilidad y contexto de mercado calculados automáticamente cada hora.',
    },
    {
      n: '02',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
      title: 'Filtro de alta selectividad',
      body:  'Un modelo predictivo entrenado sobre miles de operaciones históricas. Solo pasan las señales con mayor probabilidad estadística de éxito.',
    },
    {
      n: '03',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
      title: 'Directo a tu Telegram',
      body:  'En tu franja horaria, con tu nivel de filtro. Entrada, Stop Loss y Take Profit en cada mensaje. Sin aplicaciones adicionales.',
    },
  ]

  return (
    <section className="py-28 px-6 bg-stone-50" id="como-funciona">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">
            El proceso
          </div>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight">
            Cómo funciona
          </h2>
          <p className="mt-4 text-stone-500 text-lg max-w-xl mx-auto">
            Tres pasos automáticos. Tú solo configuras una vez.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(s => (
            <div
              key={s.n}
              className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  {s.icon}
                </div>
                <span className="text-5xl font-bold text-stone-100 select-none">{s.n}</span>
              </div>
              <h3 className="font-bold text-stone-900 text-lg mb-3">{s.title}</h3>
              <p className="text-stone-500 leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Métricas ───────────────────────────────────────────────────────────── */
function MetricsSection() {
  // Métricas HONESTAS: walk-forward out-of-sample 2023-2026, ejecución
  // limit, PnL neto con comisiones. Umbral Selectivo (0.60), 150 señales.
  // Publicamos también lo incómodo (drawdown, WR < 50%): el sistema gana
  // por payoff (TP 2R vs SL 1R), no por acertar más veces que fallar.
  const metrics = [
    { value: '42.7%',   label: 'Win Rate',           note: 'gana 2R, pierde 1R',      color: 'text-green-400' },
    { value: '1.15',    label: 'Profit Factor',      note: 'neto de comisiones',      color: 'text-amber-400' },
    { value: '-15.1R',  label: 'Max Drawdown',       note: 'sí, también lo publicamos', color: 'text-rose-400' },
    { value: '3 años',  label: 'Walk-forward',       note: '2023-26, out-of-sample',  color: 'text-blue-400'  },
  ]

  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">
            Track record
          </div>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight">
            Resultados verificables
          </h2>
          <p className="mt-4 text-stone-500 text-lg max-w-xl mx-auto">
            Métricas calculadas sobre datos que el modelo nunca vio durante el entrenamiento.
          </p>
        </div>

        <div className="bg-stone-900 rounded-3xl p-10 grid md:grid-cols-4 gap-8 divide-stone-700 md:divide-x">
          {metrics.map(m => (
            <div key={m.label} className="text-center md:px-6">
              <div className={`text-4xl font-bold mb-2 ${m.color}`}>{m.value}</div>
              <div className="text-white font-semibold mb-1">{m.label}</div>
              <div className="text-stone-400 text-xs">{m.note}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-stone-400 text-xs mt-5">
          Posición de $10.000 por operación · Sin descuento de comisiones · Ene 2025 – May 2026
        </p>
      </div>
    </section>
  )
}

/* ── Calculadora ────────────────────────────────────────────────────────── */
function CalculatorSection() {
  const [investment, setInvestment] = useState(500)
  const [config, setConfig] = useState<ConfigKey>('fulltime_selectivo')

  const data = CALC_DATA[config]
  const scale = investment / 10000
  const pnl      = Math.round(data.pnl      * scale)
  const pnlTrade = Math.round(data.pnlTrade * scale)
  const maxdd    = Math.round(data.maxdd    * scale)

  return (
    <section className="py-28 px-6 border-t border-stone-100">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera */}
        <div className="text-center mb-12">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">
            Calculadora
          </div>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-4">
            ¿Cuánto podrías haber ganado?
          </h2>
          <p className="text-stone-500 text-lg">
            Basado en el período de test out-of-sample · Ene 2025 – May 2026 · 16 meses
          </p>
        </div>

        {/* Controles */}
        <div className="bg-stone-50 rounded-3xl p-8 mb-6">
          {/* Slider de inversión */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-3">
              <label className="text-sm font-semibold text-stone-700">
                Inversión por operación
              </label>
              <span className="text-3xl font-bold text-amber-500">
                ${investment.toLocaleString('es-ES')}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={investment}
              onChange={e => setInvestment(Number(e.target.value))}
              className="w-full h-2 rounded-full cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-2">
              <span>$100</span>
              <span>$1.000</span>
              <span>$2.500</span>
              <span>$5.000</span>
            </div>
          </div>

          {/* Selector de configuración */}
          <div>
            <label className="text-sm font-semibold text-stone-700 block mb-3">
              Configuración
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CALC_CONFIGS.map(c => (
                <button
                  key={c.key}
                  onClick={() => setConfig(c.key)}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    config === c.key
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{c.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{c.note}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {/* PnL total */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
            <div className={`text-3xl font-bold mb-1 ${pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {pnl >= 0 ? '+' : ''}${pnl.toLocaleString('es-ES')}
            </div>
            <div className="text-sm font-medium text-stone-600">PnL total</div>
            <div className="text-xs text-stone-400 mt-1">{data.signals} operaciones</div>
          </div>

          {/* Por operación */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-amber-500 mb-1">
              {pnlTrade >= 0 ? '+' : ''}${pnlTrade.toLocaleString('es-ES')}
            </div>
            <div className="text-sm font-medium text-stone-600">Por operación</div>
            <div className="text-xs text-stone-400 mt-1">Ganancia media</div>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-1">{data.wr}%</div>
            <div className="text-sm font-medium text-stone-600">Win Rate</div>
            <div className="text-xs text-stone-400 mt-1">{data.freq} señales/sem</div>
          </div>

          {/* Max Drawdown */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-rose-500 mb-1">
              ${maxdd.toLocaleString('es-ES')}
            </div>
            <div className="text-sm font-medium text-stone-600">Max Drawdown</div>
            <div className="text-xs text-stone-400 mt-1">Peor racha histórica</div>
          </div>
        </div>

        <p className="text-center text-stone-400 text-xs">
          Resultados del período de test out-of-sample. Sin descuento de comisiones
          (~0.1% por operación en Binance Spot). Los rendimientos pasados no garantizan resultados futuros.
        </p>
      </div>
    </section>
  )
}

/* ── CTA final ──────────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-28 px-6 bg-amber-50">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-5">
          Tu configuración.<br />Tus señales.
        </h2>
        <p className="text-stone-600 text-lg mb-10 leading-relaxed">
          Elige instrumento, franja horaria y nivel de filtro.
          La señal llega a tu Telegram exactamente cuando tú quieres.
        </p>
        <Link
          href="/configurator"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-9 py-4 rounded-full text-lg transition-all duration-200 shadow-xl shadow-amber-200 hover:shadow-amber-300 hover:-translate-y-0.5"
        >
          Abrir configurador →
        </Link>
      </div>
    </section>
  )
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-stone-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="font-bold text-stone-900">Signal Dashboard</span>
        </div>

        {/* Disclaimer */}
        <p className="text-stone-400 text-xs text-center max-w-lg leading-relaxed">
          Los resultados históricos no garantizan rendimientos futuros. Las métricas
          corresponden a un período de test out-of-sample (ene 2025 – may 2026),
          posición de $10.000 por operación y sin descuento de comisiones.
        </p>

        {/* Links */}
        <div className="flex gap-6 text-xs text-stone-400">
          <Link href="/how-it-works" className="hover:text-stone-600 transition-colors">
            Cómo funciona
          </Link>
          <Link href="/configurator" className="hover:text-stone-600 transition-colors">
            Configurador
          </Link>
        </div>
      </div>
    </footer>
  )
}

/* ── Página principal ───────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <MetricsSection />
      <CalculatorSection />
      <CTASection />
      <Footer />
    </>
  )
}
