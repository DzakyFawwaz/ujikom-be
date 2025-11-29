const BaseController = require("./BaseController");
const { BoardRepository } = require("../models/Board");

/**
 * BoardController Class
 * Merepresentasikan controller untuk Board
 * Mewarisi dari BaseController dan meng-override method untuk custom behavior
 * Demonstrasi: Inheritance, Polymorphism, Method Overriding
 */
class BoardController extends BaseController {
  /**
   * Constructor
   */
  constructor() {
    super(new BoardRepository());
    // Bind methods untuk mempertahankan context
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * Validate Board request (Polymorphism - override dari parent)
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

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create Board (Polymorphism - override dari parent)
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
   * Update Board (Polymorphism - override dari parent)
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
}

// Export singleton instance
module.exports = new BoardController();
