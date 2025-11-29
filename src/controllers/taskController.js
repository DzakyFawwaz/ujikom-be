const BaseController = require("./BaseController");
const { TaskRepository } = require("../models/Task");

/**
 * TaskController Class
 * Merepresentasikan controller untuk Task
 * Mewarisi dari BaseController dan meng-override method untuk custom behavior
 * Demonstrasi: Inheritance, Polymorphism, Method Overriding
 */
class TaskController extends BaseController {
  /**
   * Constructor
   */
  constructor() {
    super(new TaskRepository());
    // Bind methods untuk mempertahankan context
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.getByBoardId = this.getByBoardId.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.reorder = this.reorder.bind(this);
    this.reorderByPosition = this.reorderByPosition.bind(this);
    this.move = this.move.bind(this);
  }

  /**
   * Validate Task request (Polymorphism - override dari parent)
   * @param {Object} data - Request body
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validateRequest(data) {
    const baseValidation = super.validateRequest(data);
    if (!baseValidation.valid) {
      return baseValidation;
    }

    const errors = [];
    if (
      !data.title ||
      typeof data.title !== "string" ||
      data.title.trim() === ""
    ) {
      errors.push("Title harus berupa string yang tidak kosong");
    }
    if (
      data.position === undefined ||
      !Number.isInteger(data.position) ||
      data.position < 0
    ) {
      errors.push("Position harus berupa angka non-negatif");
    }
    if (
      !data.board_id ||
      typeof data.board_id !== "number" ||
      data.board_id <= 0
    ) {
      errors.push("Board ID harus berupa angka positif");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create Task (Polymorphism - override dari parent)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  create(req, res) {
    const validation = this.validateRequest(req.body);
    if (!validation.valid) {
      return this.sendError(res, 400, validation.errors.join(", "));
    }

    super.create(req, res);
  }

  /**
   * Update Task (Polymorphism - override dari parent)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  update(req, res) {
    const validation = this.validateRequest(req.body);
    if (!validation.valid) {
      return this.sendError(res, 400, validation.errors.join(", "));
    }

    super.update(req, res);
  }

  /**
   * Get Tasks by Board ID (Custom method - tidak di-override dari parent)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  getByBoardId(req, res) {
    const { board_id } = req.params;

    if (!board_id || typeof parseInt(board_id) !== "number") {
      return this.sendError(res, 400, "Board ID harus berupa angka");
    }

    this._repository.getByBoardId(board_id, (err, entities) => {
      if (err) {
        return this.sendError(res, 500, err.message);
      }
      this.sendSuccess(
        res,
        200,
        entities.map((entity) => entity.toJSON())
      );
    });
  }

  /**
   * Reorder - Swap positions between two tasks
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  reorder(req, res) {
    const { taskId1, taskId2 } = req.body;

    if (!taskId1 || !taskId2) {
      return this.sendError(res, 400, "taskId1 dan taskId2 harus disediakan");
    }

    if (!Number.isInteger(taskId1) || !Number.isInteger(taskId2)) {
      return this.sendError(res, 400, "taskId1 dan taskId2 harus berupa angka");
    }

    this._repository.reorder(taskId1, taskId2, (err) => {
      if (err) {
        return this.sendError(res, 400, err.message);
      }
      this.sendSuccess(res, 200, { message: "Tasks reordered successfully" });
    });
  }

  /**
   * Reorder by Position - Change task position within a board
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  reorderByPosition(req, res) {
    const { id } = req.params;
    const { newPosition } = req.body;

    if (!id || newPosition === undefined) {
      return this.sendError(
        res,
        400,
        "Task ID dan newPosition harus disediakan"
      );
    }

    if (!Number.isInteger(id) || !Number.isInteger(newPosition)) {
      return this.sendError(
        res,
        400,
        "Task ID dan newPosition harus berupa angka"
      );
    }

    if (newPosition < 0) {
      return this.sendError(res, 400, "newPosition harus non-negatif");
    }

    this._repository.reorderByPosition(id, newPosition, (err) => {
      if (err) {
        return this.sendError(res, 400, err.message);
      }
      this.sendSuccess(res, 200, {
        message: "Task position updated successfully",
      });
    });
  }

  /**
   * Move Task to Different Board
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  move(req, res) {
    const { taskId, newBoardId, newPosition } = req.body;

    if (!taskId || !newBoardId) {
      return this.sendError(res, 400, "taskId dan newBoardId harus disediakan");
    }

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return this.sendError(res, 400, "taskId harus berupa angka positif");
    }

    if (!Number.isInteger(newBoardId) || newBoardId <= 0) {
      return this.sendError(res, 400, "newBoardId harus berupa angka positif");
    }

    if (newPosition !== undefined && newPosition !== null) {
      if (!Number.isInteger(newPosition) || newPosition < 0) {
        return this.sendError(
          res,
          400,
          "newPosition harus berupa angka non-negatif"
        );
      }
    }

    this._repository.moveToBoard(
      taskId,
      newBoardId,
      newPosition,
      (err, updatedTask) => {
        if (err) {
          return this.sendError(res, 400, err.message);
        }
        this.sendSuccess(res, 200, updatedTask.toJSON());
      }
    );
  }
}

// Export singleton instance
module.exports = new TaskController();
