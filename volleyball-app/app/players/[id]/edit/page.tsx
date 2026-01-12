import { getPlayer, updatePlayer } from '@/app/actions/players'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { POSITION_KEYS, POSITIONS } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EditPlayerPage({
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

  const positionOptions = POSITION_KEYS.map((key) => ({
    value: key,
    label: POSITIONS[key],
  }))

  const handednessOptions = [
    { value: 'right', label: '右利き' },
    { value: 'left', label: '左利き' },
  ]

  async function handleUpdate(formData: FormData) {
    'use server'
    await updatePlayer(id, formData)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">選手を編集</h1>
        <Link href={`/players/${id}`}>
          <Button variant="outline">← 詳細に戻る</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
            <Input
              name="name"
              label="名前"
              defaultValue={player.name}
              required
            />
            <Input
              name="number"
              label="背番号"
              type="number"
              min="0"
              max="99"
              defaultValue={player.number}
              required
            />
            <Select
              name="position"
              label="ポジション"
              options={positionOptions}
              defaultValue={player.position}
              required
            />
            <Select
              name="handedness"
              label="利き手"
              options={handednessOptions}
              defaultValue={player.handedness}
              required
            />
            <Input
              name="height"
              label="身長 (cm)"
              type="number"
              min="100"
              max="250"
              defaultValue={player.height || ''}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <textarea
                name="memo"
                rows={3}
                defaultValue={player.memo || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">スキル設定</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="spike"
                  label="スパイク"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={player.spike}
                />
                <Input
                  name="block"
                  label="ブロック"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={player.block}
                />
                <Input
                  name="receive"
                  label="レシーブ"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={player.receive}
                />
                <Input
                  name="serve"
                  label="サーブ"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={player.serve}
                />
                <Input
                  name="toss"
                  label="トス"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={player.toss}
                />
                <Input
                  name="connect"
                  label="つなぎ"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={player.connect}
                />
                <Input
                  name="decision"
                  label="判断"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={player.decision}
                />
              </div>
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
