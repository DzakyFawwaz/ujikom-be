# Task Management API

Simple CRUD API untuk mengelola Board dan Task.

## Struktur Database

### Table: Board

- `id` (INTEGER, PRIMARY KEY) - Unique identifier
- `nama` (TEXT) - Board name

### Table: Task

- `id` (INTEGER, PRIMARY KEY) - Unique identifier
- `nama` (TEXT) - Task name
- `position` (INTEGER) - Task position/order
- `board_id` (INTEGER, FOREIGN KEY) - Reference to Board

## Instalasi

```bash
npm install
```

## Menjalankan Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### Board Endpoints

**Create Board**

```
POST /api/boards
Body: { "nama": "Board Name" }
```

**Get All Boards**

```
GET /api/boards
```

**Get Board by ID**

```
GET /api/boards/:id
```

**Update Board**

```
PUT /api/boards/:id
Body: { "nama": "Updated Board Name" }
```

**Delete Board**

```
DELETE /api/boards/:id
```

### Task Endpoints

**Create Task**

```
POST /api/tasks
Body: { "nama": "Task Name", "position": 1, "board_id": 1 }
```

**Get All Tasks**

```
GET /api/tasks
```

**Get Task by ID**

```
GET /api/tasks/:id
```

**Get Tasks by Board ID**

```
GET /api/tasks/board/:board_id
```

**Update Task**

```
PUT /api/tasks/:id
Body: { "nama": "Updated Task Name", "position": 2, "board_id": 1 }
```

**Delete Task**

```
DELETE /api/tasks/:id
```

## Folder Structure

```
src/
├── database/
│   ├── db.js          - Database connection
│   └── init.js        - Database initialization & table creation
├── models/
│   ├── Board.js       - Board model with database operations
│   └── Task.js        - Task model with database operations
├── controllers/
│   ├── boardController.js - Board request handlers
│   └── taskController.js  - Task request handlers
├── routes/
│   ├── boardRoutes.js  - Board routes
│   └── taskRoutes.js   - Task routes
└── index.js           - Main server file
```
