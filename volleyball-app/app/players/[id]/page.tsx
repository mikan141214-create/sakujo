import { getPlayer, deletePlayer } from '@/app/actions/players'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkillRadar } from '@/components/SkillRadar'
import { getPositionLabel, getConditionColor } from '@/lib/utils'
import { calculateOverallSkill } from '@/lib/scoring'
import Link from 'next/link'
import { format } from 'date-fns'
import { redirect } from 'next/navigation'

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getPlayer(id)

  if (!result.success || !result.data) {
    redirect('/players')
  }

  const player = result.data

  const overallSkill = calculateOverallSkill({
    spike: player.spike,
    block: player.block,
    receive: player.receive,
    serve: player.serve,
    toss: player.toss,
    connect: player.connect,
    decision: player.decision,
  })

  async function handleDelete() {
    'use server'
    await deletePlayer(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            #{player.number} {player.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {getPositionLabel(player.position)} / {player.handedness === 'right' ? '右利き' : '左利き'}
            {player.height && ` / ${player.height}cm`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/players/${id}/edit`}>
            <Button variant="secondary">編集</Button>
          </Link>
          <form action={handleDelete}>
            <Button type="submit" variant="danger">
              削除
            </Button>
          </form>
          <Link href="/players">
            <Button variant="outline">← 一覧</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>スキル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm text-gray-600">総合スキル</div>
              <div className="text-4xl font-bold text-blue-600">
                {Math.round(overallSkill)}
              </div>
            </div>
            <SkillRadar
              skills={{
                spike: player.spike,
                block: player.block,
                receive: player.receive,
                serve: player.serve,
                toss: player.toss,
                connect: player.connect,
                decision: player.decision,
              }}
            />
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">スパイク:</span>
                <span className="font-semibold">{player.spike}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ブロック:</span>
                <span className="font-semibold">{player.block}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">レシーブ:</span>
                <span className="font-semibold">{player.receive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">サーブ:</span>
                <span className="font-semibold">{player.serve}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">トス:</span>
                <span className="font-semibold">{player.toss}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">つなぎ:</span>
                <span className="font-semibold">{player.connect}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">判断:</span>
                <span className="font-semibold">{player.decision}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>コンディション履歴</CardTitle>
              <Link href={`/players/${id}/condition`}>
                <Button size="sm">+ 記録</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {player.conditions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                コンディションデータがありません
              </p>
            ) : (
              <div className="space-y-3">
                {player.conditions.slice(0, 10).map((condition) => (
                  <div
                    key={condition.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900">
                        {format(new Date(condition.date), 'yyyy/MM/dd')}
                      </div>
                      <div
                        className={`text-sm font-semibold ${getConditionColor(
                          condition.health,
                          condition.fatigue
                        )}`}
                      >
                        {condition.health - condition.fatigue > 0
                          ? '良好'
                          : condition.health - condition.fatigue === 0
                          ? '普通'
                          : '注意'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>体調: {condition.health}/5</div>
                      <div>疲労: {condition.fatigue}/5</div>
                      <div>モチベ: {condition.motivation}/5</div>
                      {condition.pain > 0 && (
                        <div className="text-red-600">
                          痛み: {condition.pain}/5
                        </div>
                      )}
                    </div>
                    {condition.memo && (
                      <p className="text-sm text-gray-600 mt-2">
                        {condition.memo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {player.memo && (
        <Card>
          <CardHeader>
            <CardTitle>メモ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{player.memo}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
