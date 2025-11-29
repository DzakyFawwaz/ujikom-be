# Task Management API

Complete CRUD API untuk mengelola Board dan Task dengan arsitektur OOP yang sempurna.

## Fitur

- ✅ RESTful API for Board (Column) dan Task management
- ✅ Object-Oriented Programming dengan Encapsulation, Inheritance, Polymorphism, Interface Implementation
- ✅ SQLite Database dengan Foreign Key constraints
- ✅ CORS support untuk frontend development
- ✅ Advanced task operations (Reorder, Move between boards)
- ✅ Comprehensive error handling dan validation

## Struktur Database

### Table: Board

- `id` (INTEGER, PRIMARY KEY) - Unique identifier
- `title` (TEXT, NOT NULL) - Board name/title
- Timestamps: createdAt, updatedAt

### Table: Task

- `id` (INTEGER, PRIMARY KEY) - Unique identifier
- `title` (TEXT, NOT NULL) - Task name/title
- `position` (INTEGER, NOT NULL) - Task position/order within board
- `board_id` (INTEGER, NOT NULL, FOREIGN KEY) - Reference to Board
- Timestamps: createdAt, updatedAt

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

### Board Endpoints (Column)

**Create Board**

```
POST /api/columns
Body: { "title": "My Board" }
Response: { id, title, createdAt, updatedAt }
```

**Get All Boards**

```
GET /api/columns
Response: Array of board objects
```

**Get Board by ID**

```
GET /api/columns/:id
Response: { id, title, createdAt, updatedAt }
```

**Update Board**

```
PUT /api/columns/:id
Body: { "title": "Updated Board Name" }
Response: { id, title, createdAt, updatedAt }
```

**Delete Board**

```
DELETE /api/columns/:id
Response: { message: "Board deleted successfully" }
```

### Task Endpoints

**Create Task**

```
POST /api/tasks
Body: { "title": "Task Name", "position": 0, "board_id": 1 }
Response: { id, title, position, board_id, createdAt, updatedAt }
```

**Get All Tasks**

```
GET /api/tasks
Response: Array of task objects
```

**Get Task by ID**

```
GET /api/tasks/:id
Response: { id, title, position, board_id, createdAt, updatedAt }
```

**Get Tasks by Board ID**

```
GET /api/tasks/board/:board_id
Response: Array of task objects filtered by board
```

**Update Task**

```
PUT /api/tasks/:id
Body: { "title": "Updated Task", "position": 1, "board_id": 1 }
Response: { id, title, position, board_id, createdAt, updatedAt }
```

**Delete Task**

```
DELETE /api/tasks/:id
Response: { message: "Task deleted successfully" }
```

**Reorder Tasks (Swap Positions)**

```
POST /api/tasks/reorder
Body: { "taskId1": 1, "taskId2": 2 }
Response: { message: "Tasks reordered successfully" }
Description: Swaps positions between two tasks within the same board
```

**Move Task to Different Board**

```
POST /api/tasks/move
Body: {
  "taskId": 1,
  "newBoardId": 2,
  "newPosition": 0  // optional - if omitted, task appends to end
}
Response: { id, title, position, board_id, createdAt, updatedAt }
Description: Moves task to different board and recalculates positions in both boards
Error: Returns error if task not found or board doesn't exist or same board
```

**Reorder by Position**

```
PUT /api/tasks/:id/reorder-position
Body: { "newPosition": 2 }
Response: { message: "Task position updated successfully" }
Description: Changes task position within its current board
```

## OOP Implementation

Proyek ini menerapkan Object-Oriented Programming principles:

### Encapsulation

- Private properties dengan underscore prefix (`_id`, `_title`, `_position`, `_board_id`)
- Public getters dan setters untuk property access
- Validation di dalam setters

### Inheritance

```
Entity (Abstract Base)
├── Board
└── Task

BaseController (Abstract Base)
├── BoardController
└── TaskController

IRepository (Interface)
├── BoardRepository
└── TaskRepository
```

### Polymorphism

- Override methods di child classes (validateRequest, create, update)
- Abstract methods di base classes (validate, toJSON, toString)

### Interfaces

- `IEntity` - Defines entity contract
- `IRepository` - Defines repository pattern contract

### Method Overloading

- Default parameters untuk flexible method signatures
- Optional parameters (newPosition in moveToBoard)

## Struktur File

```
src/
├── database/
│   ├── db.js              - Database connection
│   └── init.js            - Database initialization & table creation
├── models/
│   ├── Entity.js          - Abstract base class
│   ├── Board.js           - Board model & BoardRepository
│   └── Task.js            - Task model & TaskRepository
├── controllers/
│   ├── BaseController.js  - Abstract base controller
│   ├── boardController.js - Board request handlers
│   └── taskController.js  - Task request handlers
├── interfaces/
│   ├── IEntity.js         - Entity interface contract
│   └── IRepository.js     - Repository interface contract
├── routes/
│   ├── boardRoutes.js     - Board REST routes
│   └── taskRoutes.js      - Task REST routes
├── OOP_IMPLEMENTATION.md  - Detailed OOP documentation
└── index.js               - Main server file
```

## Testing

### Quick Test Commands

```bash
# Create board
curl -X POST http://localhost:3000/api/columns \
  -H "Content-Type: application/json" \
  -d '{"title": "My Board"}'

# Get all boards
curl http://localhost:3000/api/columns

# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Task 1", "position": 0, "board_id": 1}'

# Move task to different board
curl -X POST http://localhost:3000/api/tasks/move \
  -H "Content-Type: application/json" \
  -d '{"taskId": 1, "newBoardId": 2, "newPosition": 0}'
```
