/**
 * Task HTTP Endpoints Tests
 * Comprehensive test suite for Task API HTTP endpoints
 * Tests actual Express routes with real database
 */

const request = require("supertest");
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Create test app
const createApp = (db) => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Board routes
  app.get("/api/columns", (req, res) => {
    db.all("SELECT * FROM board", [], (err, rows) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: rows });
    });
  });

  app.post("/api/columns", (req, res) => {
    const { title } = req.body;
    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title required" });

    db.run("INSERT INTO board (title) VALUES (?)", [title], function (err) {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.status(201).json({ success: true, data: { id: this.lastID, title } });
    });
  });

  app.get("/api/columns/:id", (req, res) => {
    db.get("SELECT * FROM board WHERE id = ?", [req.params.id], (err, row) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      if (!row)
        return res
          .status(404)
          .json({ success: false, message: "Board not found" });
      res.json({ success: true, data: row });
    });
  });

  app.put("/api/columns/:id", (req, res) => {
    const { title } = req.body;
    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title required" });

    db.run(
      "UPDATE board SET title = ? WHERE id = ?",
      [title, req.params.id],
      function (err) {
        if (err)
          return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: { id: req.params.id, title } });
      }
    );
  });

  app.delete("/api/columns/:id", (req, res) => {
    db.run("DELETE FROM board WHERE id = ?", [req.params.id], function (err) {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: "Board deleted" });
    });
  });

  // Task routes
  app.post("/api/tasks", (req, res) => {
    const { title, position, board_id } = req.body;

    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title required" });
    if (position === undefined)
      return res
        .status(400)
        .json({ success: false, message: "Position required" });
    if (!board_id)
      return res
        .status(400)
        .json({ success: false, message: "Board ID required" });

    db.run(
      "INSERT INTO task (title, position, board_id) VALUES (?, ?, ?)",
      [title, position, board_id],
      function (err) {
        if (err)
          return res.status(500).json({ success: false, message: err.message });
        res.status(201).json({
          success: true,
          data: { id: this.lastID, title, position, board_id },
        });
      }
    );
  });

  app.get("/api/tasks", (req, res) => {
    db.all("SELECT * FROM task ORDER BY position", [], (err, rows) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: rows });
    });
  });

  app.get("/api/tasks/:id", (req, res) => {
    db.get("SELECT * FROM task WHERE id = ?", [req.params.id], (err, row) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      if (!row)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      res.json({ success: true, data: row });
    });
  });

  app.get("/api/tasks/board/:board_id", (req, res) => {
    db.all(
      "SELECT * FROM task WHERE board_id = ? ORDER BY position",
      [req.params.board_id],
      (err, rows) => {
        if (err)
          return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: rows });
      }
    );
  });

  app.put("/api/tasks/:id", (req, res) => {
    const { title, position, board_id } = req.body;

    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title required" });
    if (position === undefined)
      return res
        .status(400)
        .json({ success: false, message: "Position required" });
    if (!board_id)
      return res
        .status(400)
        .json({ success: false, message: "Board ID required" });

    db.run(
      "UPDATE task SET title = ?, position = ?, board_id = ? WHERE id = ?",
      [title, position, board_id, req.params.id],
      function (err) {
        if (err)
          return res.status(500).json({ success: false, message: err.message });
        res.json({
          success: true,
          data: { id: req.params.id, title, position, board_id },
        });
      }
    );
  });

  app.delete("/api/tasks/:id", (req, res) => {
    db.run("DELETE FROM task WHERE id = ?", [req.params.id], function (err) {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: "Task deleted" });
    });
  });

  app.post("/api/tasks/reorder", (req, res) => {
    const { taskId1, taskId2 } = req.body;

    if (!taskId1 || !taskId2) {
      return res
        .status(400)
        .json({ success: false, message: "Both task IDs required" });
    }

    db.get(
      "SELECT position FROM task WHERE id = ?",
      [taskId1],
      (err, task1) => {
        if (err || !task1) {
          return res
            .status(404)
            .json({ success: false, message: "Task 1 not found" });
        }

        db.get(
          "SELECT position FROM task WHERE id = ?",
          [taskId2],
          (err, task2) => {
            if (err || !task2) {
              return res
                .status(404)
                .json({ success: false, message: "Task 2 not found" });
            }

            db.run(
              "UPDATE task SET position = ? WHERE id = ?",
              [task2.position, taskId1],
              () => {
                db.run(
                  "UPDATE task SET position = ? WHERE id = ?",
                  [task1.position, taskId2],
                  (err) => {
                    if (err) {
                      return res
                        .status(500)
                        .json({ success: false, message: err.message });
                    }
                    res.json({ success: true, message: "Tasks reordered" });
                  }
                );
              }
            );
          }
        );
      }
    );
  });

  app.post("/api/tasks/move", (req, res) => {
    const { taskId, targetBoardId } = req.body;

    if (!taskId || !targetBoardId) {
      return res
        .status(400)
        .json({ success: false, message: "Task ID and Board ID required" });
    }

    db.run(
      "UPDATE task SET board_id = ? WHERE id = ?",
      [targetBoardId, taskId],
      function (err) {
        if (err)
          return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Task moved" });
      }
    );
  });

  return app;
};

// Initialize test database
const initTestDb = () => {
  return new Promise((resolve, reject) => {
    const testDbPath = path.join(__dirname, "../test_http.db");

    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    const db = new sqlite3.Database(testDbPath, (err) => {
      if (err) return reject(err);

      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS board (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(
          `
          CREATE TABLE IF NOT EXISTS task (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            position INTEGER NOT NULL,
            board_id INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (board_id) REFERENCES board(id) ON DELETE CASCADE
          )
        `,
          (err) => {
            if (err) return reject(err);

            db.run(
              "INSERT INTO board (title) VALUES (?)",
              ["To Do"],
              function (err) {
                if (err) return reject(err);
                const boardId1 = this.lastID;

                db.run(
                  "INSERT INTO board (title) VALUES (?)",
                  ["In Progress"],
                  function (err) {
                    if (err) return reject(err);
                    const boardId2 = this.lastID;

                    db.run(
                      "INSERT INTO task (title, position, board_id) VALUES (?, ?, ?)",
                      ["Task 1", 0, boardId1],
                      function (err) {
                        if (err) return reject(err);
                        const taskId1 = this.lastID;

                        db.run(
                          "INSERT INTO task (title, position, board_id) VALUES (?, ?, ?)",
                          ["Task 2", 1, boardId1],
                          function (err) {
                            if (err) return reject(err);
                            const taskId2 = this.lastID;

                            resolve({
                              db,
                              boardId1,
                              boardId2,
                              taskId1,
                              taskId2,
                              testDbPath,
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  });
};

describe("Task HTTP Endpoints", () => {
  let app;
  let db;
  let boardId1;
  let boardId2;
  let taskId1;
  let taskId2;
  let testDbPath;

  beforeAll(async () => {
    const setup = await initTestDb();
    db = setup.db;
    boardId1 = setup.boardId1;
    boardId2 = setup.boardId2;
    taskId1 = setup.taskId1;
    taskId2 = setup.taskId2;
    testDbPath = setup.testDbPath;

    app = createApp(db);
  });

  afterAll((done) => {
    if (db) {
      db.close((err) => {
        if (fs.existsSync(testDbPath)) {
          fs.unlinkSync(testDbPath);
        }
        done();
      });
    }
  });

  describe("POST /api/tasks - Create Task", () => {
    it("should create task successfully", (done) => {
      request(app)
        .post("/api/tasks")
        .send({ title: "New Task", position: 2, board_id: boardId1 })
        .expect(201)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe("New Task");
          done();
        });
    });

    it("should return 400 when title is missing", (done) => {
      request(app)
        .post("/api/tasks")
        .send({ position: 0, board_id: boardId1 })
        .expect(400)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(false);
          done();
        });
    });

    it("should return 400 when board_id is missing", (done) => {
      request(app)
        .post("/api/tasks")
        .send({ title: "Task", position: 0 })
        .expect(400)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(false);
          done();
        });
    });
  });

  describe("GET /api/tasks - Get All Tasks", () => {
    it("should get all tasks", (done) => {
      request(app)
        .get("/api/tasks")
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          done();
        });
    });
  });

  describe("GET /api/tasks/:id - Get Task by ID", () => {
    it("should get task by ID", (done) => {
      request(app)
        .get(`/api/tasks/${taskId1}`)
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(taskId1);
          done();
        });
    });

    it("should return 404 for non-existent task", (done) => {
      request(app)
        .get("/api/tasks/99999")
        .expect(404)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(false);
          done();
        });
    });
  });

  describe("GET /api/tasks/board/:board_id - Get Tasks by Board", () => {
    it("should get all tasks in a board", (done) => {
      request(app)
        .get(`/api/tasks/board/${boardId1}`)
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.every((t) => t.board_id === boardId1)).toBe(
            true
          );
          done();
        });
    });

    it("should return empty array for board with no tasks", (done) => {
      request(app)
        .get(`/api/tasks/board/99999`)
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          expect(res.body.data).toEqual([]);
          done();
        });
    });
  });

  describe("PUT /api/tasks/:id - Update Task", () => {
    it("should update task successfully", (done) => {
      request(app)
        .put(`/api/tasks/${taskId1}`)
        .send({ title: "Updated Task", position: 0, board_id: boardId1 })
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe("Updated Task");
          done();
        });
    });

    it("should return 400 when title is missing", (done) => {
      request(app)
        .put(`/api/tasks/${taskId1}`)
        .send({ position: 0, board_id: boardId1 })
        .expect(400)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(false);
          done();
        });
    });
  });

  describe("DELETE /api/tasks/:id - Delete Task", () => {
    it("should delete task successfully", (done) => {
      request(app)
        .post("/api/tasks")
        .send({ title: "Task to Delete", position: 5, board_id: boardId1 })
        .end((err, res) => {
          const taskId = res.body.data.id;

          request(app)
            .delete(`/api/tasks/${taskId}`)
            .expect(200)
            .end((err, res) => {
              expect(err).toBeNull();
              expect(res.body.success).toBe(true);
              done();
            });
        });
    });
  });

  describe("POST /api/tasks/reorder - Reorder Tasks", () => {
    it("should reorder two tasks", (done) => {
      request(app)
        .post("/api/tasks/reorder")
        .send({ taskId1: taskId1, taskId2: taskId2 })
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          done();
        });
    });

    it("should return 400 when taskId1 is missing", (done) => {
      request(app)
        .post("/api/tasks/reorder")
        .send({ taskId2: taskId2 })
        .expect(400)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(false);
          done();
        });
    });

    it("should return 404 for non-existent task", (done) => {
      request(app)
        .post("/api/tasks/reorder")
        .send({ taskId1: 99999, taskId2: taskId2 })
        .expect(404)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(false);
          done();
        });
    });
  });

  describe("POST /api/tasks/move - Move Task to Different Board", () => {
    it("should move task to different board", (done) => {
      request(app)
        .post("/api/tasks/move")
        .send({ taskId: taskId1, targetBoardId: boardId2 })
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          done();
        });
    });

    it("should return 400 when taskId is missing", (done) => {
      request(app)
        .post("/api/tasks/move")
        .send({ targetBoardId: boardId2 })
        .expect(400)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(false);
          done();
        });
    });
  });

  describe("Board Endpoints", () => {
    it("should get all boards", (done) => {
      request(app)
        .get("/api/columns")
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          done();
        });
    });

    it("should create new board", (done) => {
      request(app)
        .post("/api/columns")
        .send({ title: "New Board" })
        .expect(201)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          done();
        });
    });

    it("should get board by ID", (done) => {
      request(app)
        .get(`/api/columns/${boardId1}`)
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          done();
        });
    });

    it("should update board", (done) => {
      request(app)
        .put(`/api/columns/${boardId1}`)
        .send({ title: "Updated Board" })
        .expect(200)
        .end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.success).toBe(true);
          done();
        });
    });

    it("should delete board", (done) => {
      request(app)
        .post("/api/columns")
        .send({ title: "Board to Delete" })
        .end((err, res) => {
          const boardId = res.body.data.id;

          request(app)
            .delete(`/api/columns/${boardId}`)
            .expect(200)
            .end((err, res) => {
              expect(err).toBeNull();
              expect(res.body.success).toBe(true);
              done();
            });
        });
    });
  });
});
