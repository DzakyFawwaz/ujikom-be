/**
 * BaseController Class
 * Abstract base class untuk semua controllers
 * Mengimplementasikan polymorphism dengan method yang bisa di-override
 * Demonstrasi: Inheritance, Polymorphism, Encapsulation
 */
class BaseController {
  /**
   * Constructor
   * @param {IRepository} repository - Repository instance
   */
  constructor(repository) {
    if (!repository) {
      throw new Error("Repository is required");
    }
    // Private repository
    this._repository = repository;
  }

  /**
   * Get Repository (Protected access)
   * @returns {IRepository} Repository instance
   */
  getRepository() {
    return this._repository;
  }

  /**
   * Create handler (dapat di-override di child class)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  create(req, res) {
    const { body } = req;

    this._repository.create(body, (err, entity) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json(entity.toJSON());
    });
  }

  /**
   * Get all handler (dapat di-override di child class)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  getAll(req, res) {
    this._repository.getAll((err, entities) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json(entities.map((entity) => entity.toJSON()));
    });
  }

  /**
   * Get by ID handler (dapat di-override di child class)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  getById(req, res) {
    const { id } = req.params;

    this._repository.getById(id, (err, entity) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!entity) {
        return res.status(404).json({ error: "Entity not found" });
      }
      res.status(200).json(entity.toJSON());
    });
  }

  /**
   * Update handler (dapat di-override di child class)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  update(req, res) {
    const { id } = req.params;
    const { body } = req;

    this._repository.update(id, body, (err, entity) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(200).json(entity.toJSON());
    });
  }

  /**
   * Delete handler (dapat di-override di child class)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  delete(req, res) {
    const { id } = req.params;

    this._repository.delete(id, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: "Entity deleted successfully" });
    });
  }

  /**
   * Validate request data (dapat di-override di child class)
   * @param {Object} data - Data untuk di-validate
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validateRequest(data) {
    if (!data) {
      return { valid: false, errors: ["Request body is required"] };
    }
    return { valid: true, errors: [] };
  }

  /**
   * Handle error response (dapat di-override di child class)
   * @param {Object} res - Express response
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   */
  sendError(res, statusCode, message) {
    res.status(statusCode).json({ error: message });
  }

  /**
   * Handle success response (dapat di-override di child class)
   * @param {Object} res - Express response
   * @param {number} statusCode - HTTP status code
   * @param {Object} data - Response data
   */
  sendSuccess(res, statusCode, data) {
    res.status(statusCode).json(data);
  }
}

module.exports = BaseController;
