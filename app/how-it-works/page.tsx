'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/* ── Equity curve (mismos puntos que la landing) ───────────────────────── */
const CURVE_PTS = [
  [0, 215], [12, 210], [20, 213], [32, 207], [45, 200], [55, 204],
  [68, 196], [80, 189], [88, 193], [100, 185], [113, 178], [122, 182],
  [135, 174], [148, 167], [156, 172], [169, 163], [182, 156], [190, 160],
  [203, 152], [216, 145], [224, 149], [237, 141], [250, 134], [258, 138],
  [271, 130], [284, 123], [292, 127], [305, 119], [318, 112], [326, 116],
  [339, 108], [352, 101], [360, 105], [373, 97], [386, 90], [394, 94],
  [407, 86], [420, 79], [428, 83], [441, 75], [454, 68], [462, 72],
  [475, 64], [480, 61],
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
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-100' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className="font-bold text-xl tracking-tight text-stone-900">Signal Dashboard</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-500">
          <Link href="/how-it-works" className="text-amber-600 font-semibold">Cómo funciona</Link>
          <Link href="/how-it-works#sistema" className="hover:text-stone-900 transition-colors">El sistema</Link>
        </div>
        <Link href="/configurator" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md">
          Configurar →
        </Link>
      </div>
    </nav>
  )
}

/* ── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="pt-28 pb-16 px-6 bg-stone-50 border-b border-stone-100">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-4">
          Transparencia total
        </div>
        <h1 className="text-5xl font-bold text-stone-900 tracking-tight mb-6">
          Cómo funciona Signal Dashboard
        </h1>
        <p className="text-xl text-stone-500 leading-relaxed">
          Un sistema algorítmico que analiza BTC/USDT cada hora, aplica reglas técnicas
          probadas y un filtro de probabilidad para enviarte solo las señales con mayor
          probabilidad estadística de éxito.
        </p>
      </div>
    </section>
  )
}

/* ── Pipeline ───────────────────────────────────────────────────────────── */
function PipelineSection() {
  const steps = [
    {
      n: '01', color: 'border-blue-400', badge: 'bg-blue-50 text-blue-600',
      title: 'Descarga de datos',
      script: '01_download_data.py',
      body: 'Cada hora descargamos las velas OHLCV de BTC/USDT de Binance en temporalidad de 1 hora y 4 horas. El sistema tiene 5 años de historia para aprender.',
    },
    {
      n: '02', color: 'border-blue-400', badge: 'bg-blue-50 text-blue-600',
      title: 'Indicadores técnicos',
      script: '02_indicators.py',
      body: 'Calculamos automáticamente EMA20, EMA50, RSI de 14 períodos, ATR14, posición del precio en su rango, volumen relativo y otros 14 indicadores.',
    },
    {
      n: '03', color: 'border-cyan-400', badge: 'bg-cyan-50 text-cyan-700',
      title: 'Reglas de entrada',
      script: '03_rules.py',
      body: 'Detectamos dos patrones técnicos — Pullback y Breakout — con filtro de tendencia en 4H. Cada señal incluye Stop Loss y Take Profit calculados sobre la volatilidad del momento.',
    },
    {
      n: '04', color: 'border-cyan-400', badge: 'bg-cyan-50 text-cyan-700',
      title: 'Backtest histórico',
      script: '04_backtest.py',
      body: 'Simulamos cada señal vela a vela sobre 5 años de datos. Si en la misma vela se tocan SL y TP, asumimos el peor caso. Esta metodología conservadora evita resultados inflados.',
    },
    {
      n: '05', color: 'border-violet-400', badge: 'bg-violet-50 text-violet-700',
      title: 'Dataset para el modelo',
      script: '06_prepare_dataset.py',
      body: 'Construimos un conjunto de 4.574 señales etiquetadas. Una señal es ganadora (label=1) si alcanza al menos R≥0.5 — la mitad del camino hacia el Take Profit.',
    },
    {
      n: '06', color: 'border-violet-400', badge: 'bg-violet-50 text-violet-700',
      title: 'Entreno del modelo',
      script: '07_train_model.py',
      body: 'Entrenamos un modelo predictivo (gradient boosting) con validación walk-forward: cada predicción se evalúa sobre datos que el modelo nunca vio. El modelo aprende qué contextos de mercado dan mejores probabilidades a una señal.',
    },
    {
      n: '07', color: 'border-green-400', badge: 'bg-green-50 text-green-700',
      title: 'Señal live en Telegram',
      script: '08_live_signal.py',
      body: 'El sistema corre en un servidor VPS las 24 horas. Cada vez que cierra una vela de 1H, evalúa si hay una señal válida y, si supera el umbral de probabilidad configurado, la envía a tu Telegram.',
    },
  ]

  return (
    <section className="py-24 px-6" id="sistema">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">El pipeline</div>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight">
            De datos a señal: 7 pasos
          </h2>
          <p className="mt-4 text-stone-500 text-lg max-w-2xl mx-auto">
            Todo el proceso es automático y reproducible. Aquí explicamos exactamente qué hace el sistema en cada paso.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {steps.map((s, i) => (
            <div key={s.n} className={`bg-white rounded-2xl border border-stone-100 shadow-sm p-6 border-l-4 ${s.color} ${i === 6 ? 'md:col-span-2 md:max-w-xl md:mx-auto' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span className="text-3xl font-bold text-stone-100">{s.n}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-bold text-stone-900">{s.title}</h3>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${s.badge}`}>{s.script}</span>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Reglas de entrada ──────────────────────────────────────────────────── */
function RulesSection() {
  return (
    <section className="py-24 px-6 bg-stone-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">Patrones técnicos</div>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight">Las reglas de entrada</h2>
          <p className="mt-4 text-stone-500 text-lg max-w-2xl mx-auto">
            El sistema detecta dos patrones probados en mercados de tendencia. Ambos requieren confirmación de la tendencia en 4H antes de emitir la señal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Pullback */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 border-t-4 border-t-amber-400">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              PATRÓN 1 — PULLBACK
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-4">Retroceso a la EMA20</h3>
            <p className="text-stone-500 text-sm mb-5 leading-relaxed">
              El precio está en tendencia alcista y retrocede hasta apoyarse en la media móvil de 20 períodos. El sistema espera una vela de confirmación que cierre por encima antes de entrar.
            </p>
            <ul className="space-y-2">
              {[
                'Precio toca la EMA20 en temporalidad 1H',
                'EMA20 por encima de EMA50 (tendencia alcista)',
                'RSI entre 35 y 65 (no sobrecomprado)',
                'Vela de confirmación cierra sobre la EMA20',
                'Tendencia 4H alineada (EMA20 4H > EMA50 4H)',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Breakout */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 border-t-4 border-t-green-400">
            <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              PATRÓN 2 — BREAKOUT
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-4">Ruptura de estructura</h3>
            <p className="text-stone-500 text-sm mb-5 leading-relaxed">
              El precio supera el máximo de las últimas 20 velas con volumen superior a la media. Indica que el mercado tiene suficiente fuerza compradora para continuar al alza.
            </p>
            <ul className="space-y-2">
              {[
                'Precio supera el máximo de las últimas 20 velas',
                'Volumen superior a la media de 20 períodos',
                'EMA20 por encima de EMA50 (momentum activo)',
                'ATR en zona normal (sin volatilidad extrema)',
                'Tendencia 4H alineada (EMA20 4H > EMA50 4H)',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SL y TP */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <h4 className="font-bold text-stone-900 mb-3">Stop Loss y Take Profit</h4>
            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex items-center gap-3">
                <span className="bg-red-100 text-red-600 font-mono text-xs px-2 py-1 rounded flex-shrink-0">SL</span>
                <span>1.25 × ATR14 — se adapta a la volatilidad de cada señal</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-600 font-mono text-xs px-2 py-1 rounded flex-shrink-0">TP</span>
                <span>2.0R — el doble de la distancia al Stop Loss (cierre del 100%)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-stone-100 text-stone-500 font-mono text-xs px-2 py-1 rounded flex-shrink-0">⏱</span>
                <span>Máximo 24 horas sin cierre → salida automática</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h4 className="font-bold text-stone-900 mb-3">Filtro de confluencia 4H</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              Antes de confirmar cualquier señal en 1H, el sistema verifica que la tendencia en 4H esté alineada: EMA20 4H por encima de EMA50 4H para señales LONG. Este filtro elimina señales a contratendencia y es uno de los factores que más contribuye a mejorar el Win Rate.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── El filtro ML ───────────────────────────────────────────────────────── */
function MLSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">El diferenciador</div>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight">El filtro de probabilidad</h2>
          <p className="mt-4 text-stone-500 text-lg max-w-2xl mx-auto">
            No todas las señales técnicas tienen la misma probabilidad de éxito. El modelo aprende a distinguir las de alta calidad.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: 'Qué aprende el modelo',
              icon: '🧠',
              body: 'El modelo predictivo (ML) analiza 20 características de cada señal — RSI, ATR, volumen, hora del día, posición del precio en su rango, spread entre medias, y más. Aprende qué combinación de factores hace que una señal tenga alta probabilidad de alcanzar el Take Profit.',
            },
            {
              title: 'Cómo se valida',
              icon: '🔬',
              body: 'Usamos validación walk-forward en 7 bloques temporales. El modelo nunca ve el futuro: cada bloque entrena con datos anteriores y se evalúa en datos posteriores. Esto simula exactamente cómo funcionaría en producción real.',
            },
            {
              title: 'La etiqueta R≥0.5',
              icon: '🎯',
              body: 'Una señal se considera ganadora si alcanza al menos la mitad del camino hacia el Take Profit (R≥0.5). Un trade que cierra con mínima ganancia por tiempo no cuenta como éxito — el modelo aprende a identificar señales con convicción real.',
            },
          ].map(c => (
            <div key={c.title} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
              <div className="text-4xl mb-4">{c.icon}</div>
              <h3 className="font-bold text-stone-900 text-lg mb-3">{c.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Train/test split visual */}
        <div className="bg-stone-900 rounded-3xl p-10">
          <h3 className="text-white font-bold text-xl mb-2">División train / test</h3>
          <p className="text-stone-400 text-sm mb-8">
            El modelo aprende sobre datos hasta diciembre 2024. Las métricas que mostramos corresponden al período de test — datos que el modelo nunca vio.
          </p>
          <div className="flex rounded-xl overflow-hidden h-12 mb-4">
            <div className="bg-violet-600 flex items-center px-5 text-white text-sm font-semibold" style={{ width: '78%' }}>
              ENTRENAMIENTO — 2020 a 2024 (~4 años)
            </div>
            <div className="bg-green-500 flex items-center px-4 text-white text-sm font-semibold" style={{ width: '22%' }}>
              TEST — 2025→
            </div>
          </div>
          <div className="flex gap-8 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-violet-600 flex-shrink-0" />
              El modelo aprende los patrones aquí
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-green-500 flex-shrink-0" />
              Las métricas de la web se calculan aquí — datos no vistos
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Track record ───────────────────────────────────────────────────────── */
function TrackRecordSection() {
  const metrics = [
    { label: 'Win Rate',         value: '42.7%',          note: 'gana 2R al acertar, pierde 1R al fallar', color: 'text-green-600' },
    { label: 'Profit Factor',    value: '1.15',           note: 'Selectivo · neto de comisiones', color: 'text-amber-500' },
    { label: 'Max Drawdown',     value: '-15.1R',         note: 'también publicamos lo incómodo', color: 'text-rose-500' },
    { label: 'Señales/semana',   value: '0.2 – 3.4',     note: 'según configuración',   color: 'text-blue-500'   },
  ]

  return (
    <section className="py-24 px-6 bg-stone-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">Track record</div>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight">Resultados honestos, sin maquillar</h2>
          <p className="mt-4 text-stone-500 text-lg max-w-2xl mx-auto">
            2023 – 2026 · validación walk-forward · el modelo nunca vio los datos sobre los que se mide
          </p>
        </div>

        {/* Equity curve */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-10">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="font-bold text-stone-900 text-lg">Curva de equity — Walk-forward · Selectivo</div>
              <div className="text-stone-400 text-sm mt-1">150 operaciones out-of-sample · 2023-2026 · comisiones incluidas</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">+14.7R</div>
              <div className="text-stone-400 text-sm">Win Rate 42.7% · PF 1.15</div>
            </div>
          </div>
          <div
            className="relative w-full"
            style={{ animation: 'revealChart 2.5s ease-out 0.3s both' }}
          >
            <svg viewBox="0 0 480 240" className="w-full h-auto">
              <defs>
                <linearGradient id="fillGradHIW" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.01" />
                </linearGradient>
                <pattern id="gridHIW" width="48" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 40" fill="none" stroke="#E7E5E4" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="480" height="240" fill="url(#gridHIW)" />
              <polygon points={FILL_PTS} fill="url(#fillGradHIW)" />
              <polyline points={CURVE_PTS} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="480" cy="61" r="5" fill="#F59E0B" />
              <circle cx="480" cy="61" r="10" fill="#F59E0B" opacity="0.2" className="animate-ping" />
            </svg>
            <div className="absolute right-1 inset-y-0 flex flex-col justify-between py-2 text-xs font-mono text-stone-400 pointer-events-none">
              <span>+$51k</span><span>+$25k</span><span>$0</span>
            </div>
            <div className="absolute bottom-0 inset-x-0 flex justify-between px-1 text-xs text-stone-400 pointer-events-none">
              <span>Ene &apos;25</span><span>Sep &apos;25</span><span>May &apos;26</span>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid md:grid-cols-4 gap-5">
          {metrics.map(m => (
            <div key={m.label} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
              <div className={`text-3xl font-bold mb-1 ${m.color}`}>{m.value}</div>
              <div className="font-semibold text-stone-800 text-sm mb-1">{m.label}</div>
              <div className="text-xs text-stone-400">{m.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Lo que el sistema puede y no puede hacer ───────────────────────────── */
function HonestySection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">Transparencia</div>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight">
            Lo que el sistema puede y no puede hacer
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Puede */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
            <h3 className="font-bold text-green-800 text-lg mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
              Lo que hace bien
            </h3>
            <ul className="space-y-3">
              {[
                'Identifica patrones técnicos con alta probabilidad histórica',
                'Filtra señales de baja calidad usando 20 indicadores cuantitativos',
                'Opera con Stop Loss y Take Profit predefinidos — sin decisiones emocionales',
                'Funciona de forma automática 24/7 sin intervención manual',
                'Permite configurar el nivel de filtro según tu tolerancia al riesgo',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-green-900">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* No puede */}
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8">
            <h3 className="font-bold text-rose-800 text-lg mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✗</span>
              Sus limitaciones
            </h3>
            <ul className="space-y-3">
              {[
                'No predice el futuro — trabaja con probabilidades, no certezas',
                'No garantiza que los resultados históricos se repitan',
                'No garantiza señales en todos los períodos de mercado — en laterales la frecuencia cae',
                'No incluye el coste de comisiones (~0.1% por operación en Binance)',
                'No sustituye el criterio propio ni el asesoramiento financiero',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-rose-900">
                  <span className="text-rose-500 mt-0.5 flex-shrink-0">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CTA ────────────────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-24 px-6 bg-amber-50">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-5">
          ¿Todo claro? Configura tus señales.
        </h2>
        <p className="text-stone-600 text-lg mb-10 leading-relaxed">
          Elige franja horaria y nivel de filtro. En 2 minutos tienes tu configuración lista.
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
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="font-bold text-stone-900">Signal Dashboard</span>
        </Link>
        <p className="text-stone-400 text-xs text-center max-w-lg leading-relaxed">
          Los resultados históricos no garantizan rendimientos futuros. Métricas calculadas sobre período de test out-of-sample (ene 2025 – may 2026), posición de $10.000 por operación, sin descuento de comisiones.
        </p>
        <div className="flex gap-6 text-xs text-stone-400">
          <Link href="/" className="hover:text-stone-600 transition-colors">Inicio</Link>
          <Link href="/configurator" className="hover:text-stone-600 transition-colors">Configurador</Link>
        </div>
      </div>
    </footer>
  )
}

/* ── Página ─────────────────────────────────────────────────────────────── */
export default function HowItWorks() {
  return (
    <>
      <Navbar />
      <Hero />
      <PipelineSection />
      <RulesSection />
      <MLSection />
      <TrackRecordSection />
      <HonestySection />
      <CTASection />
      <Footer />
    </>
  )
}
