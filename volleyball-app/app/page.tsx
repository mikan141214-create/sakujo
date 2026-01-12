import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getConditionColor } from '@/lib/utils'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 今日のコンディションを取得
  const todayConditions = await prisma.condition.findMany({
    where: {
      date: today,
    },
    include: {
      player: true,
    },
  })

  // 全選手を取得
  const allPlayers = await prisma.player.findMany({
    orderBy: { number: 'asc' },
  })

  // 平均値を計算
  const avgHealth =
    todayConditions.length > 0
      ? todayConditions.reduce((sum, c) => sum + c.health, 0) / todayConditions.length
      : 0
  const avgFatigue =
    todayConditions.length > 0
      ? todayConditions.reduce((sum, c) => sum + c.fatigue, 0) / todayConditions.length
      : 0
  const avgMotivation =
    todayConditions.length > 0
      ? todayConditions.reduce((sum, c) => sum + c.motivation, 0) / todayConditions.length
      : 0

  // 警告が必要な選手
  const warningPlayers = todayConditions.filter(
    (c) => c.health <= 2 || c.fatigue >= 4 || c.pain >= 3
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-1">{format(today, 'yyyy年MM月dd日')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>平均体調</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {avgHealth > 0 ? avgHealth.toFixed(1) : '-'}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {todayConditions.length}名記録
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>平均疲労</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">
              {avgFatigue > 0 ? avgFatigue.toFixed(1) : '-'}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {todayConditions.length}名記録
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>平均モチベーション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {avgMotivation > 0 ? avgMotivation.toFixed(1) : '-'}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {todayConditions.length}名記録
            </p>
          </CardContent>
        </Card>
      </div>

      {warningPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">注意が必要な選手</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warningPlayers.map((condition) => (
                <Link
                  key={condition.id}
                  href={`/players/${condition.playerId}`}
                  className="block p-3 bg-red-50 rounded hover:bg-red-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">
                        #{condition.player.number} {condition.player.name}
                      </span>
                      <div className="text-sm text-gray-600 mt-1">
                        体調: {condition.health} / 疲労: {condition.fatigue}
                        {condition.pain > 0 && ` / 痛み: ${condition.pain}`}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>今日のチーム状態</CardTitle>
        </CardHeader>
        <CardContent>
          {todayConditions.length === 0 ? (
            <p className="text-gray-500">本日のコンディションデータがありません</p>
          ) : (
            <div className="space-y-2">
              {todayConditions.map((condition) => (
                <Link
                  key={condition.id}
                  href={`/players/${condition.playerId}`}
                  className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">
                        #{condition.player.number} {condition.player.name}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span
                        className={getConditionColor(
                          condition.health,
                          condition.fatigue
                        )}
                      >
                        体調 {condition.health} / 疲労 {condition.fatigue}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>登録選手数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{allPlayers.length}</div>
            <Link
              href="/players"
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              選手一覧へ →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                href="/players/new"
                className="block p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                + 選手を追加
              </Link>
              <Link
                href="/formations/new"
                className="block p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
              >
                + フォーメーションを作成
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
