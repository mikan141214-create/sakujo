import { getPlayers } from '@/app/actions/players'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getPositionLabel, getSkillColor } from '@/lib/utils'
import { calculateOverallSkill } from '@/lib/scoring'

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>
}) {
  const params = await searchParams
  const result = await getPlayers(params.search, params.sort)

  if (!result.success || !result.data) {
    return <div>Failed to load players</div>
  }

  const players = result.data

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">選手管理</h1>
        <Link href="/players/new">
          <Button>+ 選手を追加</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <form className="flex-1">
              <input
                type="text"
                name="search"
                placeholder="名前または背番号で検索..."
                defaultValue={params.search}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </form>
            <select
              name="sort"
              defaultValue={params.sort}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">並び替え</option>
              <option value="number">背番号</option>
              <option value="skill">総合スキル</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              選手が登録されていません
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => {
                const overallSkill = calculateOverallSkill({
                  spike: player.spike,
                  block: player.block,
                  receive: player.receive,
                  serve: player.serve,
                  toss: player.toss,
                  connect: player.connect,
                  decision: player.decision,
                })

                return (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-xl font-bold text-gray-900">
                          #{player.number} {player.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getPositionLabel(player.position)}
                        </div>
                      </div>
                      <div
                        className={`text-2xl font-bold ${getSkillColor(
                          Math.round(overallSkill)
                        )}`}
                      >
                        {Math.round(overallSkill)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">スパイク:</span>{' '}
                        {player.spike}
                      </div>
                      <div>
                        <span className="text-gray-600">ブロック:</span>{' '}
                        {player.block}
                      </div>
                      <div>
                        <span className="text-gray-600">レシーブ:</span>{' '}
                        {player.receive}
                      </div>
                      <div>
                        <span className="text-gray-600">サーブ:</span>{' '}
                        {player.serve}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
