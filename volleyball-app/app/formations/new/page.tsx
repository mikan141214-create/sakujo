'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createFormation } from '@/app/actions/formations'
import { getPlayers } from '@/app/actions/players'
import Link from 'next/link'
import { getCourtPositionLabel, getPositionLabel } from '@/lib/utils'

type Player = {
  id: string
  name: string
  number: number
  position: string
}

export default function NewFormationPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPositions, setSelectedPositions] = useState<Record<number, string>>({})
  const [liberoSettings, setLiberoSettings] = useState<Record<number, boolean>>({})
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPlayers() {
      const result = await getPlayers()
      if (result.success && result.data) {
        setPlayers(result.data)
      }
    }
    loadPlayers()
  }, [])

  const handlePositionChange = (position: number, playerId: string) => {
    setSelectedPositions((prev) => ({
      ...prev,
      [position]: playerId,
    }))
  }

  const handleLiberoToggle = (position: number) => {
    setLiberoSettings((prev) => ({
      ...prev,
      [position]: !prev[position],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (Object.keys(selectedPositions).length !== 6) {
      setError('6人全員を配置してください')
      return
    }

    const formData = new FormData()
    formData.append('name', formName)
    formData.append('description', formDescription)

    const positions = Object.entries(selectedPositions).map(([pos, playerId]) => ({
      position: parseInt(pos),
      playerId,
      isLibero: liberoSettings[parseInt(pos)] || false,
      liberoFor: undefined,
    }))

    const result = await createFormation(formData, positions)

    if (result.success) {
      window.location.href = '/formations'
    } else {
      setError(result.error || 'Failed to create formation')
    }
  }

  const getPlayerById = (id: string) => players.find((p) => p.id === id)

  const courtPositions = [
    { position: 4, label: '前衛左' },
    { position: 3, label: '前衛中' },
    { position: 2, label: '前衛右' },
    { position: 5, label: '後衛左' },
    { position: 6, label: '後衛中' },
    { position: 1, label: '後衛右' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          フォーメーション作成
        </h1>
        <Link href="/formations">
          <Button variant="outline">← 一覧に戻る</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="フォーメーション名"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>選手配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {courtPositions.map(({ position, label }) => {
                const selectedPlayer = selectedPositions[position]
                  ? getPlayerById(selectedPositions[position])
                  : null
                const isLibero = liberoSettings[position] || false

                return (
                  <div
                    key={position}
                    className={`p-4 border-2 rounded-lg ${
                      isLibero
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      位置 {position} - {label}
                    </div>
                    <select
                      value={selectedPositions[position] || ''}
                      onChange={(e) => handlePositionChange(position, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                    >
                      <option value="">選手を選択</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number} {player.name} ({getPositionLabel(player.position)})
                        </option>
                      ))}
                    </select>
                    {selectedPlayer && (
                      <div>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={isLibero}
                            onChange={() => handleLiberoToggle(position)}
                            className="mr-2"
                          />
                          リベロとして配置
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
              <p className="font-semibold mb-1">配置のヒント:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>位置1〜6は時計回りに回転します</li>
                <li>前衛: 2, 3, 4 / 後衛: 1, 5, 6</li>
                <li>リベロは後衛のみ配置可能（通常はMBと交代）</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            保存
          </Button>
          <Link href="/formations" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              キャンセル
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
