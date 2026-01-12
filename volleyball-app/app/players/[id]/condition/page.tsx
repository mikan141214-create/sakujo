import { getPlayer } from '@/app/actions/players'
import { upsertCondition } from '@/app/actions/conditions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function ConditionPage({
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
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          コンディション記録
        </h1>
        <Link href={`/players/${id}`}>
          <Button variant="outline">← 詳細に戻る</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            #{player.number} {player.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertCondition} className="space-y-4">
            <input type="hidden" name="playerId" value={id} />

            <Input
              name="date"
              label="日付"
              type="date"
              defaultValue={today}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  体調 (1-5)
                </label>
                <input
                  type="range"
                  name="health"
                  min="1"
                  max="5"
                  defaultValue="3"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>悪い</span>
                  <span>普通</span>
                  <span>良い</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  疲労 (1-5)
                </label>
                <input
                  type="range"
                  name="fatigue"
                  min="1"
                  max="5"
                  defaultValue="3"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>少ない</span>
                  <span>普通</span>
                  <span>多い</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  モチベーション (1-5)
                </label>
                <input
                  type="range"
                  name="motivation"
                  min="1"
                  max="5"
                  defaultValue="3"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>低い</span>
                  <span>普通</span>
                  <span>高い</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  痛み (0-5)
                </label>
                <input
                  type="range"
                  name="pain"
                  min="0"
                  max="5"
                  defaultValue="0"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>なし</span>
                  <span>普通</span>
                  <span>強い</span>
                </div>
              </div>
            </div>

            <Input name="painArea" label="痛みの部位" placeholder="例: 右膝" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <textarea
                name="memo"
                rows={3}
                placeholder="特記事項があれば記入してください"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                保存
              </Button>
              <Link href={`/players/${id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  キャンセル
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
