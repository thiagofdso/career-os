import Database from 'better-sqlite3';

const db = new Database(':memory:');
const tables = ['vaga', 'networking', 'entrevista', 'conteudo', 'projeto', 'orquestrador'];

tables.forEach(table => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_${table} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      origin TEXT,
      agentId TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      deadline TEXT,
      tags TEXT,
      score INTEGER,
      metadata TEXT,
      needsApproval INTEGER NOT NULL DEFAULT 0
    );
  `);

  for (let i = 0; i < 1000; i++) {
    db.exec(`
      INSERT INTO task_${table} (type, title, agentId, status, priority, needsApproval)
      VALUES (
        'type1', 'title1', 'agent1',
        '${i % 3 === 0 ? 'SENT' : (i % 3 === 1 ? 'PENDING' : 'APPROVED')}',
        'HIGH',
        ${i % 2 === 0 ? 1 : 0}
      )
    `);
  }
});

const statements = { tasks: {} };
tables.forEach(table => {
  statements.tasks[table] = {
    count: db.prepare(`SELECT COUNT(*) c FROM task_${table}`),
    countNeedsApproval: db.prepare(`SELECT COUNT(*) c FROM task_${table} WHERE needsApproval = 1`),
    countCompleted: db.prepare(`SELECT COUNT(*) c FROM task_${table} WHERE status IN ('SENT','APPROVED','ARCHIVED')`)
  };
});

function runOriginal() {
  let totalTasks = 0;
  let pendingApprovals = 0;
  let completed = 0;

  tables.forEach(table => {
    const s = statements.tasks[table];
    totalTasks += s.count.get().c;
    pendingApprovals += s.countNeedsApproval.get().c;
    completed += s.countCompleted.get().c;
  });

  return { totalTasks, pendingApprovals, completed };
}

db.exec(`
  CREATE TABLE IF NOT EXISTS metrics_cache (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    totalTasks INTEGER NOT NULL DEFAULT 0,
    pendingApprovals INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0
  );
  INSERT OR IGNORE INTO metrics_cache (id, totalTasks, pendingApprovals, completed) VALUES (1, 0, 0, 0);
`);

let initTotalTasks = 0;
let initPendingApprovals = 0;
let initCompleted = 0;

tables.forEach(table => {
  initTotalTasks += db.prepare(`SELECT COUNT(*) c FROM task_${table}`).get().c;
  initPendingApprovals += db.prepare(`SELECT COUNT(*) c FROM task_${table} WHERE needsApproval = 1`).get().c;
  initCompleted += db.prepare(`SELECT COUNT(*) c FROM task_${table} WHERE status IN ('SENT','APPROVED','ARCHIVED')`).get().c;
});

db.prepare(`UPDATE metrics_cache SET totalTasks = ?, pendingApprovals = ?, completed = ? WHERE id = 1`).run(initTotalTasks, initPendingApprovals, initCompleted);

tables.forEach(table => {
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS task_${table}_insert AFTER INSERT ON task_${table}
    BEGIN
      UPDATE metrics_cache SET
        totalTasks = totalTasks + 1,
        pendingApprovals = pendingApprovals + NEW.needsApproval,
        completed = completed + CASE WHEN NEW.status IN ('SENT','APPROVED','ARCHIVED') THEN 1 ELSE 0 END
      WHERE id = 1;
    END;

    CREATE TRIGGER IF NOT EXISTS task_${table}_update AFTER UPDATE ON task_${table}
    BEGIN
      UPDATE metrics_cache SET
        pendingApprovals = pendingApprovals - OLD.needsApproval + NEW.needsApproval,
        completed = completed
          - CASE WHEN OLD.status IN ('SENT','APPROVED','ARCHIVED') THEN 1 ELSE 0 END
          + CASE WHEN NEW.status IN ('SENT','APPROVED','ARCHIVED') THEN 1 ELSE 0 END
      WHERE id = 1;
    END;

    CREATE TRIGGER IF NOT EXISTS task_${table}_delete AFTER DELETE ON task_${table}
    BEGIN
      UPDATE metrics_cache SET
        totalTasks = totalTasks - 1,
        pendingApprovals = pendingApprovals - OLD.needsApproval,
        completed = completed - CASE WHEN OLD.status IN ('SENT','APPROVED','ARCHIVED') THEN 1 ELSE 0 END
      WHERE id = 1;
    END;
  `);
});

const statementsOptimized = {
  metrics: db.prepare(`SELECT totalTasks, pendingApprovals, completed FROM metrics_cache WHERE id = 1`)
};

function runOptimized() {
  return statementsOptimized.metrics.get();
}

// Warm up
for (let i = 0; i < 100; i++) {
  runOriginal();
  runOptimized();
}

const iter = 10000;

const startOriginal = performance.now();
for (let i = 0; i < iter; i++) {
  runOriginal();
}
const endOriginal = performance.now();

const startOptimized = performance.now();
for (let i = 0; i < iter; i++) {
  runOptimized();
}
const endOptimized = performance.now();

console.log(`Original: ${(endOriginal - startOriginal).toFixed(2)} ms`);
console.log(`Optimized: ${(endOptimized - startOptimized).toFixed(2)} ms`);
console.log(`Improvement: ${((1 - (endOptimized - startOptimized) / (endOriginal - startOriginal)) * 100).toFixed(2)}%`);
