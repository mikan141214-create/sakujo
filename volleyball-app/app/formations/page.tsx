import { getFormations, deleteFormation } from '@/app/actions/formations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getCourtPositionLabel } from '@/lib/utils'

export default async function FormationsPage() {
  const result = await getFormations()

  if (!result.success || !result.data) {
    return <div>Failed to load formations</div>
  }

  const formations = result.data

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">フォーメーション</h1>
        <Link href="/formations/new">
          <Button>+ 新規作成</Button>
        </Link>
      </div>

      {formations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-gray-500 text-center">
              フォーメーションが登録されていません
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formations.map((formation) => (
            <Card key={formation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{formation.name}</CardTitle>
                    {formation.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formation.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {formation.positions
                      .sort((a, b) => a.position - b.position)
                      .map((pos) => (
                        <div
                          key={pos.id}
                          className={`p-2 rounded text-center ${
                            pos.isLibero ? 'bg-orange-100' : 'bg-blue-100'
                          }`}
                        >
                          <div className="font-semibold">
                            位置 {pos.position}
                          </div>
                          <div className="text-xs">
                            {getCourtPositionLabel(pos.position)}
                          </div>
                          <div className="mt-1">
                            #{pos.player.number} {pos.player.name}
                          </div>
                          {pos.isLibero && (
                            <div className="text-xs text-orange-600 mt-1">
                              リベロ
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/formations/${formation.id}/simulate`} className="flex-1">
                    <Button variant="primary" className="w-full">
                      シミュレーション
                    </Button>
                  </Link>
                  <form action={async () => {
                    'use server'
                    await deleteFormation(formation.id)
                  }}>
                    <Button type="submit" variant="danger" size="sm">
                      削除
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
