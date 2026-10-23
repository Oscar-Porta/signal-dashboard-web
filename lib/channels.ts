/**
 * channels.ts
 * Configuración de canales de Telegram y métricas del configurador.
 * Los enlaces se leen de variables de entorno para facilitar
 * cambios sin tocar el código.
 *
 * Para añadir un nuevo instrumento (ETH, SOL):
 *  1. Crear los canales en Telegram
 *  2. Añadir los enlaces a .env.local y a Vercel
 *  3. Añadir una nueva entrada en CHANNEL_LINKS e INSTRUMENT_METRICS
 */

// ── Tipos ────────────────────────────────────────────────────────────────────
export type Instrument = 'BTC'
export type Franja     = 'manana' | 'america' | 'fulltime'
export type Umbral     = 'activo' | 'selectivo'

export interface FranjaMetrics {
  signals:  number   // nº señales en período test
  wr:       number   // win rate (%)
  pnl:      number   // PnL total para $10.000/trade
  pnlTrade: number   // PnL medio por trade
  maxdd:    number   // max drawdown (negativo)
  freq:     number   // señales por semana
  pf:       number   // profit factor
}

// ── Métricas HONESTAS (revisión jul-2026) ─────────────────────────────────────
// Fuente: validación walk-forward out-of-sample 2023-2026, ejecución con
// orden limit, PnL NETO de comisiones. $10.000/posición arriesgando 1%
// ($100) por operación. Las métricas anteriores provenían de un modelo
// con lookahead (corregido el 3-jul-2026) y fueron retiradas.
// Coordinado con: trading_project_signal/outputs/experiments/walkforward_1h_limit.csv
export const METRICS: Record<Instrument, Record<Franja, Record<Umbral, FranjaMetrics>>> = {
  BTC: {
    manana: {
      activo:    { signals: 115, wr: 47.0, pnl: 2686,  pnlTrade: 23,  maxdd: -2143, freq: 0.7, pf: 1.24 },
      selectivo: { signals: 28,  wr: 60.7, pnl: 1694,  pnlTrade: 61,  maxdd: -444,  freq: 0.2, pf: 2.23 },
    },
    america: {
      activo:    { signals: 149, wr: 40.9, pnl: 1416,  pnlTrade: 10,  maxdd: -2107, freq: 0.9, pf: 1.11 },
      selectivo: { signals: 36,  wr: 44.4, pnl: 658,   pnlTrade: 18,  maxdd: -613,  freq: 0.2, pf: 1.28 },
    },
    fulltime: {
      activo:    { signals: 580, wr: 38.4, pnl: -1072, pnlTrade: -2,  maxdd: -3703, freq: 3.4, pf: 0.97 },
      selectivo: { signals: 150, wr: 42.7, pnl: 1469,  pnlTrade: 10,  maxdd: -1514, freq: 0.9, pf: 1.15 },
    },
  },
}

// ── Canales de Telegram ───────────────────────────────────────────────────────
export const CHANNEL_LINKS: Record<Instrument, Record<Franja, Record<Umbral, string>>> = {
  BTC: {
    manana: {
      activo:    process.env.NEXT_PUBLIC_CHANNEL_BTC_MANANA_ACTIVO    ?? '',
      selectivo: process.env.NEXT_PUBLIC_CHANNEL_BTC_MANANA_SELECTIVO ?? '',
    },
    america: {
      activo:    process.env.NEXT_PUBLIC_CHANNEL_BTC_AMERICA_ACTIVO    ?? '',
      selectivo: process.env.NEXT_PUBLIC_CHANNEL_BTC_AMERICA_SELECTIVO ?? '',
    },
    fulltime: {
      activo:    process.env.NEXT_PUBLIC_CHANNEL_BTC_FULLTIME_ACTIVO    ?? '',
      selectivo: process.env.NEXT_PUBLIC_CHANNEL_BTC_FULLTIME_SELECTIVO ?? '',
    },
  },
}

// ── Etiquetas de display ─────────────────────────────────────────────────────
export const FRANJA_LABELS: Record<Franja, { name: string; hours: string; latam: string; desc: string }> = {
  manana:   {
    name:  'Mañana',
    hours: '06h – 14h Madrid',
    latam: '01h–09h Buenos Aires · 23h–07h México',
    desc:  'Apertura europea y sesión de Londres. Mayor rendimiento por operación.',
  },
  america:  {
    name:  'América',
    hours: '00h – 08h Madrid',
    latam: '19h–03h Buenos Aires · 16h–00h México',
    desc:  'Prime time vespertino latinoamericano. Ideal para seguir el mercado en horario cómodo.',
  },
  fulltime: {
    name:  'Full Time',
    hours: '24h · todos los días',
    latam: 'Sin restricción horaria',
    desc:  'Máxima frecuencia de señales. El sistema trabaja sin parar — tú solo lees las alertas.',
  },
}

export const UMBRAL_LABELS: Record<Umbral, { name: string; value: number; desc: string }> = {
  activo:    {
    name:  'Activo',
    value: 0.45,
    desc:  'Mayor número de señales. El filtro permite más oportunidades manteniendo un buen win rate.',
  },
  selectivo: {
    name:  'Selectivo',
    value: 0.60,
    desc:  'Solo las señales de máxima probabilidad. Menos frecuencia, win rate excepcional.',
  },
}
