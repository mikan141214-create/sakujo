'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getFormation } from '@/app/actions/formations'
import { getConditionByDate } from '@/app/actions/conditions'
import {
  rotatePosition,
  isFrontRow,
  calculateAttackPower,
  calculateDefensePower,
  calculateServePower,
  calculateBlockPower,
  PlayerSkills,
  PlayerCondition,
} from '@/lib/scoring'
import { getCourtPositionLabel } from '@/lib/utils'
import { format } from 'date-fns'

type Formation = {
  id: string
  name: string
  description: string | null
  positions: Array<{
    id: string
    position: number
    playerId: string
    isLibero: boolean
    player: {
      id: string
      name: string
      number: number
      position: string
      spike: number
      block: number
      receive: number
      serve: number
      toss: number
      connect: number
      decision: number
    }
  }>
}

type ConditionMap = Record<string, PlayerCondition>

export default function SimulatePage({ params }: { params: Promise<{ id: string }> }) {
  const [formation, setFormation] = useState<Formation | null>(null)
  const [conditions, setConditions] = useState<ConditionMap>({})
  const [currentRotation, setCurrentRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params
      const formationResult = await getFormation(resolvedParams.id)

      if (formationResult.success && formationResult.data) {
        setFormation(formationResult.data)
      }

      const conditionResult = await getConditionByDate(selectedDate)
      if (conditionResult.success && conditionResult.data) {
        const conditionMap: ConditionMap = {}
        conditionResult.data.forEach((c) => {
          conditionMap[c.playerId] = {
            health: c.health,
            fatigue: c.fatigue,
            motivation: c.motivation,
          }
        })
        setConditions(conditionMap)
      }

      setLoading(false)
    }

    loadData()
  }, [params, selectedDate])

  if (loading || !formation) {
    return <div>Loading...</div>
  }

  const handleRotate = () => {
    setCurrentRotation((prev) => (prev + 1) % 6)
  }

  const handleReset = () => {
    setCurrentRotation(0)
  }

  // 現在のローテーションでの位置を計算
  const getCurrentPositions = () => {
    return formation.positions.map((pos) => {
      let newPosition = pos.position
      for (let i = 0; i < currentRotation; i++) {
        newPosition = rotatePosition(newPosition)
      }
      return {
        ...pos,
        currentPosition: newPosition,
      }
    })
  }

  const currentPositions = getCurrentPositions()

  // 前衛・後衛を分離
  const frontRow = currentPositions.filter((p) => isFrontRow(p.currentPosition))
  const backRow = currentPositions.filter((p) => !isFrontRow(p.currentPosition))

  // パフォーマンス計算
  const frontRowData = frontRow.map((p) => ({
    skills: p.player as PlayerSkills,
    condition: conditions[p.playerId] || null,
  }))

  const backRowData = backRow.map((p) => ({
    skills: p.player as PlayerSkills,
    condition: conditions[p.playerId] || null,
  }))

  const allPlayersData = currentPositions.map((p) => ({
    skills: p.player as PlayerSkills,
    condition: conditions[p.playerId] || null,
  }))

  const attackPower = calculateAttackPower(frontRowData)
  const defensePower = calculateDefensePower(backRowData)
  const servePower = calculateServePower(allPlayersData)
  const blockPower = calculateBlockPower(frontRowData)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{formation.name}</h1>
          <p className="text-gray-600 mt-1">シミュレーション</p>
        </div>
        <Link href="/formations">
          <Button variant="outline">← 一覧に戻る</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>コンディション日付</CardTitle>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded"
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>コート配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-semibold">
                  ローテーション: {currentRotation + 1}/6
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleReset} size="sm" variant="outline">
                    リセット
                  </Button>
                  <Button onClick={handleRotate} size="sm">
                    次へ →
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
                <div className="text-center text-sm text-gray-600 mb-4">
                  ネット
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[4, 3, 2].map((pos) => {
                    const player = currentPositions.find(
                      (p) => p.currentPosition === pos
                    )
                    return (
                      <div
                        key={pos}
                        className={`p-3 rounded-lg text-center ${
                          player?.isLibero
                            ? 'bg-orange-200 border-2 border-orange-400'
                            : 'bg-blue-200 border-2 border-blue-400'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-700">
                          位置 {pos}
                        </div>
                        {player && (
                          <>
                            <div className="text-sm font-bold mt-1">
                              #{player.player.number} {player.player.name}
                            </div>
                            {player.isLibero && (
                              <div className="text-xs text-orange-700 mt-1">
                                リベロ
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[5, 6, 1].map((pos) => {
                    const player = currentPositions.find(
                      (p) => p.currentPosition === pos
                    )
                    return (
                      <div
                        key={pos}
                        className={`p-3 rounded-lg text-center ${
                          player?.isLibero
                            ? 'bg-orange-100 border-2 border-orange-300'
                            : 'bg-blue-100 border-2 border-blue-300'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-700">
                          位置 {pos}
                        </div>
                        {player && (
                          <>
                            <div className="text-sm font-bold mt-1">
                              #{player.player.number} {player.player.name}
                            </div>
                            {player.isLibero && (
                              <div className="text-xs text-orange-700 mt-1">
                                リベロ
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>パフォーマンス指標</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-semibold">攻撃力</span>
                  <span className="text-2xl font-bold text-red-600">
                    {attackPower.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold">守備力</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {defensePower.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-semibold">サーブ力</span>
                  <span className="text-2xl font-bold text-green-600">
                    {servePower.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-semibold">ブロック力</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {blockPower.toFixed(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>前衛・後衛</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    前衛 (攻撃・ブロック)
                  </div>
                  <div className="space-y-1">
                    {frontRow.map((p) => (
                      <div
                        key={p.id}
                        className="text-sm p-2 bg-blue-50 rounded flex justify-between"
                      >
                        <span>
                          #{p.player.number} {p.player.name}
                        </span>
                        <span className="text-gray-600">
                          位置 {p.currentPosition}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    後衛 (レシーブ・守備)
                  </div>
                  <div className="space-y-1">
                    {backRow.map((p) => (
                      <div
                        key={p.id}
                        className="text-sm p-2 bg-gray-50 rounded flex justify-between"
                      >
                        <span>
                          #{p.player.number} {p.player.name}
                        </span>
                        <span className="text-gray-600">
                          位置 {p.currentPosition}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
