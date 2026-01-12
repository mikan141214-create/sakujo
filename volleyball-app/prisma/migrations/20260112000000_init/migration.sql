-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "handedness" TEXT NOT NULL DEFAULT 'right',
    "height" INTEGER,
    "memo" TEXT,
    "spike" INTEGER NOT NULL DEFAULT 50,
    "block" INTEGER NOT NULL DEFAULT 50,
    "receive" INTEGER NOT NULL DEFAULT 50,
    "serve" INTEGER NOT NULL DEFAULT 50,
    "toss" INTEGER NOT NULL DEFAULT 50,
    "connect" INTEGER NOT NULL DEFAULT 50,
    "decision" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "health" INTEGER NOT NULL DEFAULT 3,
    "fatigue" INTEGER NOT NULL DEFAULT 3,
    "pain" INTEGER NOT NULL DEFAULT 0,
    "painArea" TEXT,
    "motivation" INTEGER NOT NULL DEFAULT 3,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Condition_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Formation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FormationPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formationId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isLibero" BOOLEAN NOT NULL DEFAULT 0,
    "liberoFor" INTEGER,
    CONSTRAINT "FormationPosition_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormationPosition_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_number_key" ON "Player"("number");

-- CreateIndex
CREATE INDEX "Condition_playerId_idx" ON "Condition"("playerId");

-- CreateIndex
CREATE INDEX "Condition_date_idx" ON "Condition"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Condition_playerId_date_key" ON "Condition"("playerId", "date");

-- CreateIndex
CREATE INDEX "FormationPosition_formationId_idx" ON "FormationPosition"("formationId");

-- CreateIndex
CREATE UNIQUE INDEX "FormationPosition_formationId_position_key" ON "FormationPosition"("formationId", "position");
