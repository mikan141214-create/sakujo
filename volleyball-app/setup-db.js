const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// データベースファイルのパス
const dbPath = path.join(__dirname, 'prisma', 'dev.db');

// 既存のデータベースファイルを削除（クリーンスタート）
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database file');
}

// 新しいデータベースを作成
const db = new Database(dbPath);
console.log('Created new database:', dbPath);

// マイグレーションSQLを読み込み
const migrationSQL = fs.readFileSync(
  path.join(__dirname, 'prisma', 'migrations', '20260112000000_init', 'migration.sql'),
  'utf-8'
);

// SQLを実行
db.exec(migrationSQL);
console.log('Migration executed successfully');

db.close();
console.log('Database setup complete!');
