const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'prisma', 'dev.db'));

console.log('Seeding database...');

// 既存のデータを削除
db.exec(`
  DELETE FROM FormationPosition;
  DELETE FROM Formation;
  DELETE FROM Condition;
  DELETE FROM Player;
`);

// 選手データを作成
const players = [
  { id: 'player1', name: '田中 太郎', number: 1, position: 'OH', handedness: 'right', height: 185, spike: 85, block: 70, receive: 75, serve: 80, toss: 60, connect: 70, decision: 75, memo: 'エースアタッカー。スパイク力が高く、チームの主力選手。' },
  { id: 'player2', name: '佐藤 次郎', number: 2, position: 'OP', handedness: 'left', height: 190, spike: 90, block: 75, receive: 65, serve: 85, toss: 55, connect: 65, decision: 70, memo: 'オポジット。左利きの強力なスパイカー。' },
  { id: 'player3', name: '鈴木 三郎', number: 3, position: 'MB', handedness: 'right', height: 195, spike: 75, block: 90, receive: 60, serve: 70, toss: 50, connect: 65, decision: 70, memo: 'ミドルブロッカー。ブロック力が非常に高い。' },
  { id: 'player4', name: '高橋 四郎', number: 4, position: 'S', handedness: 'right', height: 178, spike: 55, block: 60, receive: 70, serve: 75, toss: 95, connect: 85, decision: 90, memo: 'セッター。優れたトス技術とゲームメイク能力。' },
  { id: 'player5', name: '伊藤 五郎', number: 5, position: 'L', handedness: 'right', height: 170, spike: 40, block: 45, receive: 95, serve: 80, toss: 70, connect: 90, decision: 85, memo: 'リベロ。レシーブとつなぎの名手。' },
  { id: 'player6', name: '渡辺 六郎', number: 6, position: 'OH', handedness: 'right', height: 182, spike: 80, block: 70, receive: 80, serve: 75, toss: 65, connect: 75, decision: 75, memo: 'オールラウンダー。守備も攻撃もこなせる選手。' },
  { id: 'player7', name: '山本 七郎', number: 7, position: 'MB', handedness: 'left', height: 192, spike: 70, block: 85, receive: 55, serve: 65, toss: 50, connect: 60, decision: 68, memo: 'ミドルブロッカー。左利きでブロックが得意。' },
  { id: 'player8', name: '中村 八郎', number: 8, position: 'S', handedness: 'left', height: 180, spike: 60, block: 65, receive: 75, serve: 80, toss: 90, connect: 80, decision: 85, memo: 'サブセッター。左利きで戦術の幅を広げる。' },
];

const insertPlayer = db.prepare(`
  INSERT INTO Player (id, name, number, position, handedness, height, memo, spike, block, receive, serve, toss, connect, decision, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

players.forEach(player => {
  insertPlayer.run(
    player.id, player.name, player.number, player.position, player.handedness,
    player.height, player.memo, player.spike, player.block, player.receive,
    player.serve, player.toss, player.connect, player.decision
  );
});

console.log('Created players:', players.length);

// コンディションデータを作成（過去5日分）
const insertCondition = db.prepare(`
  INSERT INTO Condition (id, playerId, date, health, fatigue, motivation, pain, painArea, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

for (let i = 0; i < 5; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  date.setHours(0, 0, 0, 0);
  const dateStr = date.toISOString();

  players.forEach((player, idx) => {
    const baseHealth = 3 + Math.floor(Math.random() * 3); // 3-5
    const baseFatigue = 2 + Math.floor(Math.random() * 3); // 2-4
    const motivation = 3 + Math.floor(Math.random() * 3); // 3-5
    const pain = Math.random() < 0.2 ? Math.floor(Math.random() * 3) + 1 : 0;
    const painArea = Math.random() < 0.2 ? '膝' : null;

    insertCondition.run(
      `condition_${player.id}_day${i}`,
      player.id,
      dateStr,
      baseHealth,
      baseFatigue,
      motivation,
      pain,
      painArea
    );
  });
}

console.log('Created conditions for past 5 days');

// フォーメーション1: 基本フォーメーション
const formation1Id = 'formation1';
db.prepare(`
  INSERT INTO Formation (id, name, description, createdAt, updatedAt)
  VALUES (?, ?, ?, datetime('now'), datetime('now'))
`).run(formation1Id, '基本フォーメーション', 'スタンダードな6人配置。バランスの取れたフォーメーション。');

const insertPosition = db.prepare(`
  INSERT INTO FormationPosition (id, formationId, playerId, position, isLibero, liberoFor)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const formation1Positions = [
  { position: 1, playerId: 'player1', isLibero: 0 },
  { position: 2, playerId: 'player3', isLibero: 0 },
  { position: 3, playerId: 'player4', isLibero: 0 },
  { position: 4, playerId: 'player2', isLibero: 0 },
  { position: 5, playerId: 'player6', isLibero: 0 },
  { position: 6, playerId: 'player5', isLibero: 1 },
];

formation1Positions.forEach((pos, idx) => {
  insertPosition.run(
    `${formation1Id}_pos${pos.position}`,
    formation1Id,
    pos.playerId,
    pos.position,
    pos.isLibero,
    null
  );
});

console.log('Created formation 1: 基本フォーメーション');

// フォーメーション2: 攻撃重視
const formation2Id = 'formation2';
db.prepare(`
  INSERT INTO Formation (id, name, description, createdAt, updatedAt)
  VALUES (?, ?, ?, datetime('now'), datetime('now'))
`).run(formation2Id, '攻撃重視フォーメーション', '前衛に攻撃力の高い選手を配置。点を取りに行くフォーメーション。');

const formation2Positions = [
  { position: 1, playerId: 'player5', isLibero: 1 },
  { position: 2, playerId: 'player2', isLibero: 0 },
  { position: 3, playerId: 'player1', isLibero: 0 },
  { position: 4, playerId: 'player3', isLibero: 0 },
  { position: 5, playerId: 'player4', isLibero: 0 },
  { position: 6, playerId: 'player6', isLibero: 0 },
];

formation2Positions.forEach((pos, idx) => {
  insertPosition.run(
    `${formation2Id}_pos${pos.position}`,
    formation2Id,
    pos.playerId,
    pos.position,
    pos.isLibero,
    null
  );
});

console.log('Created formation 2: 攻撃重視フォーメーション');

db.close();
console.log('Seeding completed successfully!');
