/**
 * db/database.js  –  Project 3: Database Integration (DecodeLabs)
 *
 * Pillar 1 – The Blueprint : Schema with PK, NOT NULL, UNIQUE, CHECK
 * Pillar 2 – The Bridge    : sql.js (pure-JS SQLite), persisted to disk
 * Pillar 4 – The Shield    : Parameterized ? statements throughout
 */

const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');

const DB_PATH = path.join(__dirname, '..', 'decodelabs.db');

let _db = null;

/** Flush in-memory DB to disk */
function persist() {
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Thin wrapper that gives routes a better-sqlite3-style API:
 *   db.prepare(sql).all(...params)
 *   db.prepare(sql).get(...params)
 *   db.prepare(sql).run(...params)  → { lastInsertRowid, changes }
 */
function prepare(sql) {
  return {
    all(...params) {
      const stmt    = _db.prepare(sql);
      const results = [];
      stmt.bind(params.flat());
      while (stmt.step()) results.push(stmt.getAsObject());
      stmt.free();
      return results;
    },

    get(...params) {
      const stmt = _db.prepare(sql);
      stmt.bind(params.flat());
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },

    run(...params) {
      const stmt = _db.prepare(sql);
      stmt.bind(params.flat());
      stmt.step();
      stmt.free();
      // Read rowid IMMEDIATELY after step(), before any other operation
      const rowidRes = _db.exec('SELECT last_insert_rowid()');
      const lastInsertRowid = rowidRes[0].values[0][0];
      const changes = _db.getRowsModified();
      persist();
      return { lastInsertRowid, changes };
    },
  };
}

function exec(sql) {
  _db.run(sql);
  persist();
}

async function initDb() {
  if (_db) return;

  const SQL = await initSqlJs();

  _db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  // ── SCHEMA ────────────────────────────────────────────────
  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      age        INTEGER NOT NULL CHECK(age >= 1 AND age <= 120),
      created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
    CREATE TABLE IF NOT EXISTS products (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      category   TEXT    NOT NULL,
      price      REAL    NOT NULL CHECK(price >= 0),
      stock      INTEGER NOT NULL CHECK(stock >= 0),
      created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      email        TEXT    NOT NULL,
      subject      TEXT    NOT NULL,
      message      TEXT    NOT NULL CHECK(length(trim(message)) >= 10),
      submitted_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
  `);
  persist();

  // ── SEED ─────────────────────────────────────────────────
  const uc = _db.exec('SELECT COUNT(*) FROM users')[0].values[0][0];
  if (uc === 0) {
    _db.run("INSERT INTO users (name,email,age) VALUES ('Ali Hassan','ali@example.com',24)");
    _db.run("INSERT INTO users (name,email,age) VALUES ('Sara Khan','sara@example.com',22)");
  }
  const pc = _db.exec('SELECT COUNT(*) FROM products')[0].values[0][0];
  if (pc === 0) {
    _db.run("INSERT INTO products (name,category,price,stock) VALUES ('Laptop','electronics',75000,10)");
    _db.run("INSERT INTO products (name,category,price,stock) VALUES ('Notebook','stationery',120,50)");
  }
  persist();

  console.log(`[DB] SQLite ready → ${DB_PATH}`);
}

function getDb() { return _db; }

module.exports = { initDb, prepare, exec, getDb };
