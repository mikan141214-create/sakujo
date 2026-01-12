/**
 * スコアリング・パフォーマンス計算ロジック
 */

export interface PlayerSkills {
  spike: number
  block: number
  receive: number
  serve: number
  toss: number
  connect: number
  decision: number
}

export interface PlayerCondition {
  health: number      // 1-5
  fatigue: number     // 1-5
  motivation: number  // 1-5
}

/**
 * コンディションから補正係数を計算
 * 理想: (5-1+5)/15 = 0.6 → 1.0に正規化
 * 最低: (1-5+1)/15 = -0.2 → 0.5に正規化
 */
export function calculateConditionFactor(condition: PlayerCondition | null): number {
  if (!condition) return 1.0

  const raw = (condition.health - condition.fatigue + condition.motivation) / 15
  // -0.2 ~ 0.6 を 0.5 ~ 1.2 にマッピング
  return Math.max(0.5, Math.min(1.2, 0.5 + raw * 1.2))
}

/**
 * 総合スキルスコアを計算（重み付き平均）
 */
export function calculateOverallSkill(skills: PlayerSkills): number {
  const weights = {
    spike: 0.20,
    block: 0.15,
    receive: 0.20,
    serve: 0.15,
    toss: 0.10,
    connect: 0.10,
    decision: 0.10,
  }

  return (
    skills.spike * weights.spike +
    skills.block * weights.block +
    skills.receive * weights.receive +
    skills.serve * weights.serve +
    skills.toss * weights.toss +
    skills.connect * weights.connect +
    skills.decision * weights.decision
  )
}

/**
 * 攻撃力を計算（前衛3名のスキル平均）
 */
export function calculateAttackPower(
  frontPlayers: Array<{ skills: PlayerSkills; condition: PlayerCondition | null }>
): number {
  if (frontPlayers.length === 0) return 0

  const sum = frontPlayers.reduce((acc, player) => {
    const baseScore =
      player.skills.spike * 0.5 +
      player.skills.decision * 0.2 +
      player.skills.connect * 0.3
    const factor = calculateConditionFactor(player.condition)
    return acc + baseScore * factor
  }, 0)

  return sum / frontPlayers.length
}

/**
 * 守備力を計算（後衛3名のスキル平均）
 */
export function calculateDefensePower(
  backPlayers: Array<{ skills: PlayerSkills; condition: PlayerCondition | null }>
): number {
  if (backPlayers.length === 0) return 0

  const sum = backPlayers.reduce((acc, player) => {
    const baseScore =
      player.skills.receive * 0.6 +
      player.skills.decision * 0.2 +
      player.skills.connect * 0.2
    const factor = calculateConditionFactor(player.condition)
    return acc + baseScore * factor
  }, 0)

  return sum / backPlayers.length
}

/**
 * サーブ力を計算（全員のサーブ平均）
 */
export function calculateServePower(
  allPlayers: Array<{ skills: PlayerSkills; condition: PlayerCondition | null }>
): number {
  if (allPlayers.length === 0) return 0

  const sum = allPlayers.reduce((acc, player) => {
    const baseScore = player.skills.serve
    const factor = calculateConditionFactor(player.condition)
    return acc + baseScore * factor
  }, 0)

  return sum / allPlayers.length
}

/**
 * ブロック力を計算（前衛3名のブロック平均）
 */
export function calculateBlockPower(
  frontPlayers: Array<{ skills: PlayerSkills; condition: PlayerCondition | null }>
): number {
  if (frontPlayers.length === 0) return 0

  const sum = frontPlayers.reduce((acc, player) => {
    const baseScore = player.skills.block
    const factor = calculateConditionFactor(player.condition)
    return acc + baseScore * factor
  }, 0)

  return sum / frontPlayers.length
}

/**
 * ローテーション進行（時計回り: 1→6→5→4→3→2→1）
 */
export function rotatePosition(currentPosition: number): number {
  // 1→6, 2→1, 3→2, 4→3, 5→4, 6→5
  return currentPosition === 1 ? 6 : currentPosition - 1
}

/**
 * ポジション番号から前衛/後衛を判定
 * 前衛: 2, 3, 4
 * 後衛: 1, 5, 6
 */
export function isFrontRow(position: number): boolean {
  return [2, 3, 4].includes(position)
}
