import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const POSITIONS = {
  OH: 'アウトサイドヒッター',
  OP: 'オポジット',
  MB: 'ミドルブロッカー',
  S: 'セッター',
  L: 'リベロ',
} as const

export type PositionKey = keyof typeof POSITIONS

export const POSITION_KEYS = Object.keys(POSITIONS) as PositionKey[]

export function getPositionLabel(key: string): string {
  return POSITIONS[key as PositionKey] || key
}

export const COURT_POSITIONS = {
  1: '後衛右',
  2: '前衛右',
  3: '前衛中央',
  4: '前衛左',
  5: '後衛左',
  6: '後衛中央',
} as const

export function getCourtPositionLabel(position: number): string {
  return COURT_POSITIONS[position as keyof typeof COURT_POSITIONS] || `位置${position}`
}

/**
 * スキル値を色分けするヘルパー
 */
export function getSkillColor(value: number): string {
  if (value >= 80) return 'text-green-600'
  if (value >= 60) return 'text-blue-600'
  if (value >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * コンディション値を色分けするヘルパー
 */
export function getConditionColor(health: number, fatigue: number): string {
  const score = health - fatigue
  if (score >= 2) return 'text-green-600'
  if (score >= 0) return 'text-yellow-600'
  return 'text-red-600'
}
