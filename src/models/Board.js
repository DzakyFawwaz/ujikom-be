const Entity = require("./Entity");
const IRepository = require("../interfaces/IRepository");
const db = require("../database/db");

/**
 * Board Class
 * Merepresentasikan Board entity dengan inheritance dari Entity
 * Mengimplementasi IRepository interface untuk CRUD operations
 * Demonstrasi: Inheritance, Encapsulation, Polymorphism
 */
class Board extends Entity {
  /**
   * Constructor
   * @param {number} id - Board ID
   * @param {string} title - Board title
   * @param {Date} createdAt - Created timestamp
   * @param {Date} updatedAt - Updated timestamp
   */
  constructor(
    id = null,
    title = "",
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    super(id, createdAt, updatedAt);
    // Private properties dengan encapsulation
    this._title = title;
  }

  /**
   * Get Board title (Getter)
   * @returns {string} Board title
   */
  getTitle() {
    return this._title;
  }

  /**
   * Set Board title (Setter)
   * @param {string} title - Board title
   */
  setTitle(title) {
    if (typeof title !== "string" || title.trim() === "") {
      throw new TypeError("Title must be a non-empty string");
    }
    this._title = title.trim();
  }

  /**
   * Validate Board (Polymorphism - override dari parent)
   * @returns {boolean} Apakah board valid
   */
  validate() {
    return this._title && this._title.trim() !== "";
  }

  /**
   * Convert ke JSON (Polymorphism - override dari parent)
   * @returns {Object} Board sebagai object
   */
  toJSON() {
    return {
      ...super.toJSON(),
      title: this._title,
    };
  }

  /**
   * String representation (Polymorphism - override dari parent)
   * @returns {string} String representation
   */
  toString() {
    return `${super.toString()} title: "${this._title}"`;
  }
}

/**
 * BoardRepository Class
 * Mengimplementasi IRepository interface untuk Board CRUD operations
 * Demonstrasi: Interface Implementation, Encapsulation
 */
class BoardRepository extends IRepository {
  /**
   * Create Board
   * @param {Object} data - { title: string }
   * @param {Function} callback - Callback(err, board)
   */
  create(data, callback) {
    if (!data || !data.title) {
      return callback(new Error("title is required"), null);
    }

    try {
      const board = new Board(null, data.title);
      if (!board.validate()) {
        return callback(new Error("Invalid board data"), null);
      }

      db.run(
        "INSERT INTO Board (title) VALUES (?)",
        [board.getTitle()],
        function (err) {
          if (err) {
            callback(err, null);
          } else {
            board.setId(this.lastID);
            callback(null, board);
          }
        }
      );
    } catch (err) {
      callback(err, null);
    }
  }

  /**
   * Get all Boards
   * @param {Function} callback - Callback(err, boards)
   */
  getAll(callback) {
    db.all("SELECT * FROM Board", [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        const boards = rows.map((row) => new Board(row.id, row.title));
        callback(null, boards);
      }
    });
  }

  /**
   * Get Board by ID
   * @param {number} id - Board ID
   * @param {Function} callback - Callback(err, board)
   */
  getById(id, callback) {
    db.get("SELECT * FROM Board WHERE id = ?", [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (!row) {
        callback(null, null);
      } else {
        const board = new Board(row.id, row.title);
        callback(null, board);
      }
    });
  }

  /**
   * Update Board
   * @param {number} id - Board ID
   * @param {Object} data - { title: string }
   * @param {Function} callback - Callback(err, board)
   */
  update(id, data, callback) {
    if (!data || !data.title) {
      return callback(new Error("title is required"), null);
    }

    try {
      const board = new Board(id, data.title);
      if (!board.validate()) {
        return callback(new Error("Invalid board data"), null);
      }

      db.run(
        "UPDATE Board SET title = ? WHERE id = ?",
        [board.getTitle(), id],
        function (err) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, board);
          }
        }
      );
    } catch (err) {
      callback(err, null);
    }
  }

  /**
   * Delete Board
   * @param {number} id - Board ID
   * @param {Function} callback - Callback(err)
   */
  delete(id, callback) {
    db.run("DELETE FROM Board WHERE id = ?", [id], function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }
}

// Export both class dan repository untuk flexibility
module.exports = { Board, BoardRepository };
