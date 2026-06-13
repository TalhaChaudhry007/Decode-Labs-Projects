# Project 3: Database Integration

** Full Stack Development **

## Overview

This project builds on Project 2 by connecting the Express backend to a real, persistent SQLite database instead of relying on in-memory arrays that reset every time the server restarts. The goal was to design a proper relational schema and rebuild every CRUD operation so that data actually survives across sessions.

## The Four Pillars

The project follows the four-pillar structure laid out in the training material:

| Pillar | Title | What was implemented |
| 1 | The Blueprint – Schema & Design | Three tables (`users`, `products`, `contacts`), each with a primary key, NOT NULL constraints on required fields, a UNIQUE constraint on user emails, and CHECK constraints to enforce valid values |
| 2 | The Bridge – Integration & Connection | A single shared database connection used across the app, so the backend and the database stay in sync |
| 3 | The Action – CRUD & RESTful HTTP | Standard REST mapping: POST creates a record, GET reads it, PUT updates it, and DELETE removes it, for all three resources |
| 4 | The Shield – Integrity & Security | Every query uses parameterized placeholders instead of string concatenation, which closes off SQL injection as an attack path |

## Schema Design

```sql
-- users: email must be unique, age must be realistic
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  age        INTEGER NOT NULL CHECK(age >= 1 AND age <= 120),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- products: price and stock can never go negative
CREATE TABLE products (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  category   TEXT    NOT NULL,
  price      REAL    NOT NULL CHECK(price >= 0),
  stock      INTEGER NOT NULL CHECK(stock >= 0),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- contacts: enforce a minimum message length so empty submissions are rejected
CREATE TABLE contacts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  email        TEXT    NOT NULL,
  subject      TEXT    NOT NULL,
  message      TEXT    NOT NULL CHECK(length(trim(message)) >= 10),
  submitted_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

These constraints exist so that the database itself acts as the last line of defense. Even if something slips past the application's validation logic, the schema will reject it.

## Getting Started

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server runs at `http://localhost:3000`. On first launch, it automatically creates the SQLite database file (`decodelabs.db`) and seeds it with a couple of sample users and products so there's something to query right away.

## API Endpoints

### Users — `/api/users`

| Method | URL | Description |
| GET | `/api/users` | Returns all users |
| GET | `/api/users/:id` | Returns a single user by ID |
| POST | `/api/users` | Creates a new user — body: `{ name, email, age }` |
| PUT | `/api/users/:id` | Updates a user, partial updates are allowed |
| DELETE | `/api/users/:id` | Deletes a user |

### Products — `/api/products`

| Method | URL | Description |
| GET | `/api/products` | Returns all products, optionally filtered with `?category=electronics` |
| GET | `/api/products/:id` | Returns a single product by ID |
| POST | `/api/products` | Creates a new product — body: `{ name, category, price, stock }` |
| PUT | `/api/products/:id` | Updates a product |
| DELETE | `/api/products/:id` | Deletes a product |

### Contact — `/api/contact`

| Method | URL | Description |
| POST | `/api/contact` | Submits a new message — body: `{ name, email, subject, message }` |
| GET | `/api/contact` | Returns all submitted messages |
| GET | `/api/contact/:id` | Returns a single message by ID |
| DELETE | `/api/contact/:id` | Deletes a message |

### Other

| Method | URL | Description |
| GET | `/` | Basic API info and a list of available endpoints |
| GET | `/api/schema` | Returns the live database schema, useful for reviewing the table structure directly |

## A Note on Security

One of the main things this project focuses on is avoiding SQL injection. Every query in the codebase is written with parameterized placeholders, meaning user input is always passed in separately from the query string itself and is never treated as executable SQL.

```js
// This is how every query in this project is written.
// The input is bound as data, not interpreted as part of the SQL command.
db.prepare('SELECT * FROM users WHERE email = ?').get(userInput);

// This pattern is never used anywhere in the codebase, since concatenating
// raw input directly into a query string opens the door to injection attacks.
db.exec('SELECT * FROM users WHERE email = ' + userInput);
```