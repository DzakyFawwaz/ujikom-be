const Entity = require("./Entity");
const IRepository = require("../interfaces/IRepository");
const db = require("../database/db");

/**
 * Task Class
 * Merepresentasikan Task entity dengan inheritance dari Entity
 * Mengimplementasi interface untuk CRUD operations
 * Demonstrasi: Inheritance, Encapsulation, Polymorphism, Method Overriding
 */
class Task extends Entity {
  /**
   * Constructor (Overloading via default parameters)
   * @param {number} id - Task ID
   * @param {string} title - Task title
   * @param {number} position - Task position
   * @param {number} board_id - Board ID reference
   * @param {Date} createdAt - Created timestamp
   * @param {Date} updatedAt - Updated timestamp
   */
  constructor(
    id = null,
    title = "",
    position = 0,
    board_id = null,
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    super(id, createdAt, updatedAt);
    // Private properties dengan encapsulation
    this._title = title;
    this._position = position;
    this._board_id = board_id;
  }

  /**
   * Get Task title (Getter)
   * @returns {string} Task title
   */
  getTitle() {
    return this._title;
  }

  /**
   * Set Task title (Setter)
   * @param {string} title - Task title
   */
  setTitle(title) {
    if (typeof title !== "string" || title.trim() === "") {
      throw new TypeError("Title must be a non-empty string");
    }
    this._title = title.trim();
  }

  /**
   * Get Task position (Getter)
   * @returns {number} Task position
   */
  getPosition() {
    return this._position;
  }

  /**
   * Set Task position (Setter)
   * @param {number} position - Task position
   */
  setPosition(position) {
    if (!Number.isInteger(position) || position < 0) {
      throw new TypeError("Position must be a non-negative integer");
    }
    this._position = position;
  }

  /**
   * Get Board ID (Getter)
   * @returns {number} Board ID
   */
  getBoardId() {
    return this._board_id;
  }

  /**
   * Set Board ID (Setter)
   * @param {number} board_id - Board ID
   */
  setBoardId(board_id) {
    if (typeof board_id !== "number" || board_id <= 0) {
      throw new TypeError("Board ID must be a positive number");
    }
    this._board_id = board_id;
  }

  /**
   * Validate Task (Polymorphism - override dari parent)
   * @returns {boolean} Apakah task valid
   */
  validate() {
    return (
      this._title &&
      this._title.trim() !== "" &&
      typeof this._position === "number" &&
      this._position >= 0 &&
      this._board_id > 0
    );
  }

  /**
   * Convert ke JSON (Polymorphism - override dari parent)
   * @returns {Object} Task sebagai object
   */
  toJSON() {
    return {
      ...super.toJSON(),
      title: this._title,
      position: this._position,
      board_id: this._board_id,
    };
  }

  /**
   * String representation (Polymorphism - override dari parent)
   * @returns {string} String representation
   */
  toString() {
    return `${super.toString()} title: "${this._title}" position: ${
      this._position
    } board_id: ${this._board_id}`;
  }
}

/**
 * TaskRepository Class
 * Mengimplementasi IRepository interface untuk Task CRUD operations
 * Demonstrasi: Interface Implementation, Encapsulation
 */
class TaskRepository extends IRepository {
  /**
   * Create Task (Overloading via flexible parameters)
   * @param {Object} data - { title: string, position: number, board_id: number }
   * @param {Function} callback - Callback(err, task)
   */
  create(data, callback) {
    if (!data || !data.title || data.position === undefined || !data.board_id) {
      return callback(
        new Error("title, position, and board_id are required"),
        null
      );
    }

    try {
      const task = new Task(null, data.title, data.position, data.board_id);
      if (!task.validate()) {
        return callback(new Error("Invalid task data"), null);
      }

      db.run(
        "INSERT INTO Task (title, position, board_id) VALUES (?, ?, ?)",
        [task.getTitle(), task.getPosition(), task.getBoardId()],
        function (err) {
          if (err) {
            callback(err, null);
          } else {
            task.setId(this.lastID);
            callback(null, task);
          }
        }
      );
    } catch (err) {
      callback(err, null);
    }
  }

  /**
   * Get all Tasks
   * @param {Function} callback - Callback(err, tasks)
   */
  getAll(callback) {
    db.all("SELECT * FROM Task ORDER BY position ASC", [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        const tasks = rows.map(
          (row) => new Task(row.id, row.title, row.position, row.board_id)
        );
        callback(null, tasks);
      }
    });
  }

  /**
   * Get Task by ID
   * @param {number} id - Task ID
   * @param {Function} callback - Callback(err, task)
   */
  getById(id, callback) {
    db.get("SELECT * FROM Task WHERE id = ?", [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (!row) {
        callback(null, null);
      } else {
        const task = new Task(row.id, row.title, row.position, row.board_id);
        callback(null, task);
      }
    });
  }

  /**
   * Get Tasks by Board ID
   * @param {number} board_id - Board ID
   * @param {Function} callback - Callback(err, tasks)
   */
  getByBoardId(board_id, callback) {
    db.all(
      "SELECT * FROM Task WHERE board_id = ? ORDER BY position ASC",
      [board_id],
      (err, rows) => {
        if (err) {
          callback(err, null);
        } else {
          const tasks = rows.map(
            (row) => new Task(row.id, row.title, row.position, row.board_id)
          );
          callback(null, tasks);
        }
      }
    );
  }

  /**
   * Update Task
   * @param {number} id - Task ID
   * @param {Object} data - { title: string, position: number, board_id: number }
   * @param {Function} callback - Callback(err, task)
   */
  update(id, data, callback) {
    if (!data || !data.title || data.position === undefined || !data.board_id) {
      return callback(
        new Error("title, position, and board_id are required"),
        null
      );
    }

    try {
      const task = new Task(id, data.title, data.position, data.board_id);
      if (!task.validate()) {
        return callback(new Error("Invalid task data"), null);
      }

      db.run(
        "UPDATE Task SET title = ?, position = ?, board_id = ? WHERE id = ?",
        [task.getTitle(), task.getPosition(), task.getBoardId(), id],
        function (err) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, task);
          }
        }
      );
    } catch (err) {
      callback(err, null);
    }
  }

  /**
   * Delete Task
   * @param {number} id - Task ID
   * @param {Function} callback - Callback(err)
   */
  delete(id, callback) {
    db.run("DELETE FROM Task WHERE id = ?", [id], function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Reorder Tasks - Swap positions between two tasks
   * @param {number} taskId1 - First task ID
   * @param {number} taskId2 - Second task ID
   * @param {Function} callback - Callback(err)
   */
  reorder(taskId1, taskId2, callback) {
    if (!taskId1 || !taskId2) {
      return callback(new Error("Both task IDs are required"), null);
    }

    // Get both tasks
    db.get("SELECT * FROM Task WHERE id = ?", [taskId1], (err1, task1) => {
      if (err1) {
        return callback(err1);
      }
      if (!task1) {
        return callback(new Error("Task 1 not found"));
      }

      db.get("SELECT * FROM Task WHERE id = ?", [taskId2], (err2, task2) => {
        if (err2) {
          return callback(err2);
        }
        if (!task2) {
          return callback(new Error("Task 2 not found"));
        }

        // Swap positions
        const tempPosition = task1.position;

        db.run(
          "UPDATE Task SET position = ? WHERE id = ?",
          [task2.position, taskId1],
          (err) => {
            if (err) {
              return callback(err);
            }

            db.run(
              "UPDATE Task SET position = ? WHERE id = ?",
              [tempPosition, taskId2],
              (err) => {
                if (err) {
                  return callback(err);
                }
                callback(null);
              }
            );
          }
        );
      });
    });
  }

  /**
   * Reorder Task by Board - Change task position within a specific board
   * @param {number} taskId - Task ID to reorder
   * @param {number} newPosition - New position in the board
   * @param {Function} callback - Callback(err)
   */
  reorderByPosition(taskId, newPosition, callback) {
    if (!taskId || newPosition === undefined) {
      return callback(new Error("Task ID and new position are required"), null);
    }

    // Get the task
    db.get("SELECT * FROM Task WHERE id = ?", [taskId], (err, task) => {
      if (err) {
        return callback(err);
      }
      if (!task) {
        return callback(new Error("Task not found"));
      }

      const boardId = task.board_id;
      const oldPosition = task.position;

      // If position is the same, no need to update
      if (oldPosition === newPosition) {
        return callback(null);
      }

      if (newPosition < oldPosition) {
        // Moving up - increment positions between newPosition and oldPosition
        db.run(
          "UPDATE Task SET position = position + 1 WHERE board_id = ? AND position >= ? AND position < ?",
          [boardId, newPosition, oldPosition],
          (err) => {
            if (err) {
              return callback(err);
            }

            db.run(
              "UPDATE Task SET position = ? WHERE id = ?",
              [newPosition, taskId],
              (err) => {
                callback(err);
              }
            );
          }
        );
      } else {
        // Moving down - decrement positions between oldPosition and newPosition
        db.run(
          "UPDATE Task SET position = position - 1 WHERE board_id = ? AND position > ? AND position <= ?",
          [boardId, oldPosition, newPosition],
          (err) => {
            if (err) {
              return callback(err);
            }

            db.run(
              "UPDATE Task SET position = ? WHERE id = ?",
              [newPosition, taskId],
              (err) => {
                callback(err);
              }
            );
          }
        );
      }
    });
  }

  /**
   * Move Task to Another Board
   * @param {number} taskId - Task ID to move
   * @param {number} newBoardId - New board ID
   * @param {number} newPosition - Position in the new board (optional)
   * @param {Function} callback - Callback(err, task)
   */
  moveToBoard(taskId, newBoardId, newPosition, callback) {
    if (!taskId || !newBoardId) {
      return callback(new Error("Task ID and new board ID are required"), null);
    }

    // Get the task
    db.get("SELECT * FROM Task WHERE id = ?", [taskId], (err, task) => {
      if (err) {
        return callback(err, null);
      }
      if (!task) {
        return callback(new Error("Task not found"), null);
      }

      const oldBoardId = task.board_id;

      // If same board, no need to move
      if (oldBoardId === newBoardId) {
        return callback(new Error("Task is already in this board"), null);
      }

      // Get the max position in the new board
      const positionToUse =
        newPosition !== undefined
          ? newPosition
          : db.get(
              "SELECT MAX(position) as maxPos FROM Task WHERE board_id = ?",
              [newBoardId],
              (err, row) => {
                if (err) return callback(err, null);
                return row ? row.maxPos + 1 : 1;
              }
            );

      // Get max position if not provided
      if (newPosition === undefined) {
        db.get(
          "SELECT COALESCE(MAX(position), 0) as maxPos FROM Task WHERE board_id = ?",
          [newBoardId],
          (err, row) => {
            if (err) {
              return callback(err, null);
            }

            const finalPosition = row.maxPos + 1;

            // Update task with new board and position
            db.run(
              "UPDATE Task SET board_id = ?, position = ? WHERE id = ?",
              [newBoardId, finalPosition, taskId],
              (err) => {
                if (err) {
                  return callback(err, null);
                }

                // Recalculate positions in old board
                db.all(
                  "SELECT id FROM Task WHERE board_id = ? ORDER BY position ASC",
                  [oldBoardId],
                  (err, rows) => {
                    if (err || !rows || rows.length === 0) {
                      const updatedTask = new Task(
                        task.id,
                        task.title,
                        finalPosition,
                        newBoardId
                      );
                      return callback(null, updatedTask);
                    }

                    // Update positions sequentially
                    let updateCount = 0;
                    rows.forEach((row, index) => {
                      db.run(
                        "UPDATE Task SET position = ? WHERE id = ?",
                        [index + 1, row.id],
                        (err) => {
                          updateCount++;
                          if (updateCount === rows.length) {
                            const updatedTask = new Task(
                              task.id,
                              task.title,
                              finalPosition,
                              newBoardId
                            );
                            callback(null, updatedTask);
                          }
                        }
                      );
                    });
                  }
                );
              }
            );
          }
        );
      } else {
        // If newPosition is provided, use it directly
        db.run(
          "UPDATE Task SET board_id = ?, position = ? WHERE id = ?",
          [newBoardId, newPosition, taskId],
          (err) => {
            if (err) {
              return callback(err, null);
            }

            // Recalculate positions in old board
            db.all(
              "SELECT id FROM Task WHERE board_id = ? ORDER BY position ASC",
              [oldBoardId],
              (err, rows) => {
                if (err || !rows || rows.length === 0) {
                  const updatedTask = new Task(
                    task.id,
                    task.title,
                    newPosition,
                    newBoardId
                  );
                  return callback(null, updatedTask);
                }

                // Update positions sequentially
                let updateCount = 0;
                rows.forEach((row, index) => {
                  db.run(
                    "UPDATE Task SET position = ? WHERE id = ?",
                    [index + 1, row.id],
                    (err) => {
                      updateCount++;
                      if (updateCount === rows.length) {
                        const updatedTask = new Task(
                          task.id,
                          task.title,
                          newPosition,
                          newBoardId
                        );
                        callback(null, updatedTask);
                      }
                    }
                  );
                });
              }
            );
          }
        );
      }
    });
  }
}

// Export classes
module.exports = Task;
module.exports.TaskRepository = TaskRepository;
