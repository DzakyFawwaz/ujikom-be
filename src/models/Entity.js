const IEntity = require("../interfaces/IEntity");

/**
 * Abstract Entity Class
 * Base class untuk semua entity (Board, Task, dll)
 * Mengimplementasikan encapsulation dengan private properties
 */
class Entity extends IEntity {
  /**
   * Constructor
   * @param {number} id - Entity ID
   * @param {Date} createdAt - Tanggal dibuat
   * @param {Date} updatedAt - Tanggal diupdate
   */
  constructor(id = null, createdAt = new Date(), updatedAt = new Date()) {
    super();
    // Private properties dengan underscore convention
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  /**
   * Get ID (Getter)
   * @returns {number} Entity ID
   */
  getId() {
    return this._id;
  }

  /**
   * Set ID (Setter)
   * @param {number} id - Entity ID
   */
  setId(id) {
    if (typeof id !== "number" && id !== null) {
      throw new TypeError("ID must be a number or null");
    }
    this._id = id;
  }

  /**
   * Get Created At (Getter)
   * @returns {Date} Tanggal dibuat
   */
  getCreatedAt() {
    return this._createdAt;
  }

  /**
   * Set Created At (Setter)
   * @param {Date} date - Tanggal dibuat
   */
  setCreatedAt(date) {
    if (!(date instanceof Date)) {
      throw new TypeError("createdAt must be a Date object");
    }
    this._createdAt = date;
  }

  /**
   * Get Updated At (Getter)
   * @returns {Date} Tanggal diupdate
   */
  getUpdatedAt() {
    return this._updatedAt;
  }

  /**
   * Set Updated At (Setter)
   * @param {Date} date - Tanggal diupdate
   */
  setUpdatedAt(date) {
    if (!(date instanceof Date)) {
      throw new TypeError("updatedAt must be a Date object");
    }
    this._updatedAt = date;
  }

  /**
   * Validate entity (abstract method - harus diimplementasi di child class)
   * @returns {boolean} Apakah entity valid
   */
  validate() {
    throw new Error("validate() must be implemented by child class");
  }

  /**
   * Convert entity ke object
   * @returns {Object} Entity sebagai object
   */
  toJSON() {
    return {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * String representation
   * @returns {string} String dari entity
   */
  toString() {
    return `[${this.constructor.name}] id: ${this._id}`;
  }
}

module.exports = Entity;
