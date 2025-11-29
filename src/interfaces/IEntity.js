/**
 * IEntity Interface
 * Mendefinisikan contract untuk semua entity (Board, Task, dll)
 */
class IEntity {
  /**
   * Get ID dari entity
   * @returns {number} ID entity
   */
  getId() {
    throw new Error("getId() must be implemented");
  }

  /**
   * Validate entity data
   * @returns {boolean} Apakah entity valid
   */
  validate() {
    throw new Error("validate() must be implemented");
  }

  /**
   * Convert entity ke object
   * @returns {Object} Entity sebagai object
   */
  toJSON() {
    throw new Error("toJSON() must be implemented");
  }
}

module.exports = IEntity;
