/**
 * IRepository Interface
 * Mendefinisikan contract untuk semua repository operations
 */
class IRepository {
  /**
   * Create new record
   * @param {Object} data - Data untuk di-create
   * @param {Function} callback - Callback function
   */
  create(data, callback) {
    throw new Error("create() must be implemented");
  }

  /**
   * Get all records
   * @param {Function} callback - Callback function
   */
  getAll(callback) {
    throw new Error("getAll() must be implemented");
  }

  /**
   * Get record by ID
   * @param {number} id - ID dari record
   * @param {Function} callback - Callback function
   */
  getById(id, callback) {
    throw new Error("getById() must be implemented");
  }

  /**
   * Update record
   * @param {number} id - ID dari record
   * @param {Object} data - Data untuk di-update
   * @param {Function} callback - Callback function
   */
  update(id, data, callback) {
    throw new Error("update() must be implemented");
  }

  /**
   * Delete record
   * @param {number} id - ID dari record
   * @param {Function} callback - Callback function
   */
  delete(id, callback) {
    throw new Error("delete() must be implemented");
  }
}

module.exports = IRepository;
