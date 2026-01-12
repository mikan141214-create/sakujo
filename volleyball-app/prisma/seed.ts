import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 既存のデータを削除
  await prisma.formationPosition.deleteMany()
  await prisma.formation.deleteMany()
  await prisma.condition.deleteMany()
  await prisma.player.deleteMany()

  // 選手データを作成
  const players = await Promise.all([
    prisma.player.create({
      data: {
        name: '田中 太郎',
        number: 1,
        position: 'OH',
        handedness: 'right',
        height: 185,
        spike: 85,
        block: 70,
        receive: 75,
        serve: 80,
        toss: 60,
        connect: 70,
        decision: 75,
        memo: 'エースアタッカー。スパイク力が高く、チームの主力選手。',
      },
    }),
    prisma.player.create({
      data: {
        name: '佐藤 次郎',
        number: 2,
        position: 'OP',
        handedness: 'left',
        height: 190,
        spike: 90,
        block: 75,
        receive: 65,
        serve: 85,
        toss: 55,
        connect: 65,
        decision: 70,
        memo: 'オポジット。左利きの強力なスパイカー。',
      },
    }),
    prisma.player.create({
      data: {
        name: '鈴木 三郎',
        number: 3,
        position: 'MB',
        handedness: 'right',
        height: 195,
        spike: 75,
        block: 90,
        receive: 60,
        serve: 70,
        toss: 50,
        connect: 65,
        decision: 70,
        memo: 'ミドルブロッカー。ブロック力が非常に高い。',
      },
    }),
    prisma.player.create({
      data: {
        name: '高橋 四郎',
        number: 4,
        position: 'S',
        handedness: 'right',
        height: 178,
        spike: 55,
        block: 60,
        receive: 70,
        serve: 75,
        toss: 95,
        connect: 85,
        decision: 90,
        memo: 'セッター。優れたトス技術とゲームメイク能力。',
      },
    }),
    prisma.player.create({
      data: {
        name: '伊藤 五郎',
        number: 5,
        position: 'L',
        handedness: 'right',
        height: 170,
        spike: 40,
        block: 45,
        receive: 95,
        serve: 80,
        toss: 70,
        connect: 90,
        decision: 85,
        memo: 'リベロ。レシーブとつなぎの名手。',
      },
    }),
    prisma.player.create({
      data: {
        name: '渡辺 六郎',
        number: 6,
        position: 'OH',
        handedness: 'right',
        height: 182,
        spike: 80,
        block: 70,
        receive: 80,
        serve: 75,
        toss: 65,
        connect: 75,
        decision: 75,
        memo: 'オールラウンダー。守備も攻撃もこなせる選手。',
      },
    }),
    prisma.player.create({
      data: {
        name: '山本 七郎',
        number: 7,
        position: 'MB',
        handedness: 'left',
        height: 192,
        spike: 70,
        block: 85,
        receive: 55,
        serve: 65,
        toss: 50,
        connect: 60,
        decision: 68,
        memo: 'ミドルブロッカー。左利きでブロックが得意。',
      },
    }),
    prisma.player.create({
      data: {
        name: '中村 八郎',
        number: 8,
        position: 'S',
        handedness: 'left',
        height: 180,
        spike: 60,
        block: 65,
        receive: 75,
        serve: 80,
        toss: 90,
        connect: 80,
        decision: 85,
        memo: 'サブセッター。左利きで戦術の幅を広げる。',
      },
    }),
  ])

  console.log('Created players:', players.length)

  // コンディションデータを作成（過去5日分）
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    for (const player of players) {
      // リベロ以外のランダムなコンディション
      const baseHealth = 3 + Math.floor(Math.random() * 3) // 3-5
      const baseFatigue = 2 + Math.floor(Math.random() * 3) // 2-4
      const motivation = 3 + Math.floor(Math.random() * 3) // 3-5

      await prisma.condition.create({
        data: {
          playerId: player.id,
          date,
          health: baseHealth,
          fatigue: baseFatigue,
          motivation,
          pain: Math.random() < 0.2 ? Math.floor(Math.random() * 3) + 1 : 0,
          painArea: Math.random() < 0.2 ? '膝' : null,
        },
      })
    }
  }

  console.log('Created conditions for past 5 days')

  // フォーメーション1: 基本フォーメーション
  const formation1 = await prisma.formation.create({
    data: {
      name: '基本フォーメーション',
      description: 'スタンダードな6人配置。バランスの取れたフォーメーション。',
      positions: {
        create: [
          { position: 1, playerId: players[0].id }, // OH (田中)
          { position: 2, playerId: players[2].id }, // MB (鈴木)
          { position: 3, playerId: players[3].id }, // S (高橋)
          { position: 4, playerId: players[1].id }, // OP (佐藤)
          { position: 5, playerId: players[5].id }, // OH (渡辺)
          { position: 6, playerId: players[4].id, isLibero: true }, // L (伊藤)
        ],
      },
    },
  })

  console.log('Created formation 1:', formation1.name)

  // フォーメーション2: 攻撃重視
  const formation2 = await prisma.formation.create({
    data: {
      name: '攻撃重視フォーメーション',
      description: '前衛に攻撃力の高い選手を配置。点を取りに行くフォーメーション。',
      positions: {
        create: [
          { position: 1, playerId: players[4].id, isLibero: true }, // L (伊藤)
          { position: 2, playerId: players[1].id }, // OP (佐藤)
          { position: 3, playerId: players[0].id }, // OH (田中)
          { position: 4, playerId: players[2].id }, // MB (鈴木)
          { position: 5, playerId: players[3].id }, // S (高橋)
          { position: 6, playerId: players[5].id }, // OH (渡辺)
        ],
      },
    },
  })

  console.log('Created formation 2:', formation2.name)

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
