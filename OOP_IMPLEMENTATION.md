# OOP Implementation Guide

Dokumen ini menjelaskan implementasi Object-Oriented Programming (OOP) principles dalam project Task Management API.

## 1. Encapsulation (Enkapsulasi)

### Deskripsi

Enkapsulasi adalah prinsip untuk menyembunyikan data internal (private properties) dan hanya mengekspos interface publik melalui methods.

### Implementasi

#### Entity Class (Base Class)

```javascript
class Entity {
  // Private properties dengan underscore convention
  _id = null;
  _createdAt = null;
  _updatedAt = null;

  // Getter
  getId() {
    return this._id;
  }

  // Setter
  setId(id) {
    this._id = id;
  }
}
```

#### Board Class

```javascript
class Board extends Entity {
  // Private property
  _nama = "";

  // Public getter/setter
  getNama() {
    return this._nama;
  }
  setNama(nama) {
    this._nama = nama;
  }
}
```

#### Task Class

```javascript
class Task extends Entity {
  _nama = "";
  _position = 0;
  _board_id = null;

  // Getters dan setters untuk setiap property
  getNama() {
    return this._nama;
  }
  setNama(nama) {
    this._nama = nama;
  }

  getPosition() {
    return this._position;
  }
  setPosition(position) {
    this._position = position;
  }

  getBoardId() {
    return this._board_id;
  }
  setBoardId(board_id) {
    this._board_id = board_id;
  }
}
```

**Keuntungan:**

- Data internal terlindungi dari akses langsung
- Validasi dapat dilakukan di setter
- Perubahan internal tidak mempengaruhi client code

---

## 2. Inheritance (Pewarisan)

### Deskripsi

Inheritance memungkinkan class untuk mewarisi properties dan methods dari parent class.

### Implementasi

#### Entity - Base Class

```javascript
class Entity {
  constructor(id = null, createdAt = new Date(), updatedAt = new Date()) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  validate() {
    throw new Error("validate() must be implemented");
  }

  toJSON() {
    return {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
```

#### Board - Child Class

```javascript
class Board extends Entity {
  constructor(
    id = null,
    nama = "",
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    super(id, createdAt, updatedAt); // Call parent constructor
    this._nama = nama;
  }
}
```

#### Task - Child Class

```javascript
class Task extends Entity {
  constructor(
    id = null,
    nama = "",
    position = 0,
    board_id = null,
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    super(id, createdAt, updatedAt); // Call parent constructor
    this._nama = nama;
    this._position = position;
    this._board_id = board_id;
  }
}
```

**Keuntungan:**

- Code reusability - id, createdAt, updatedAt tidak perlu di-copy
- Konsistensi - semua entity punya interface yang sama
- Maintenance - perubahan di base class otomatis berlaku ke child class

---

## 3. Polymorphism (Polimorfisme)

### Deskripsi

Polymorphism memungkinkan objects dari berbagai class merespons same message dengan cara yang berbeda (method overriding).

### Method Overriding

#### Parent Class (Entity)

```javascript
class Entity {
  validate() {
    throw new Error("validate() must be implemented");
  }

  toJSON() {
    return {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
```

#### Child Class Override (Board)

```javascript
class Board extends Entity {
  // Override validate()
  validate() {
    return this._nama && this._nama.trim() !== "";
  }

  // Override toJSON()
  toJSON() {
    return {
      ...super.toJSON(), // Call parent's toJSON()
      nama: this._nama,
    };
  }
}
```

#### Child Class Override (Task)

```javascript
class Task extends Entity {
  // Override validate() dengan logic yang berbeda
  validate() {
    return (
      this._nama &&
      this._nama.trim() !== "" &&
      typeof this._position === "number" &&
      this._position >= 0 &&
      this._board_id > 0
    );
  }

  // Override toJSON()
  toJSON() {
    return {
      ...super.toJSON(),
      nama: this._nama,
      position: this._position,
      board_id: this._board_id,
    };
  }
}
```

#### BaseController - Parent

```javascript
class BaseController {
  create(req, res) {
    this._repository.create(req.body, (err, entity) => {
      res.status(201).json(entity.toJSON());
    });
  }
}
```

#### BoardController - Override

```javascript
class BoardController extends BaseController {
  create(req, res) {
    // Custom validation
    const validation = this.validateRequest(req.body);
    if (!validation.valid) {
      return this.sendError(res, 400, validation.errors.join(", "));
    }
    // Call parent's create
    super.create(req, res);
  }
}
```

**Keuntungan:**

- Flexibility - setiap class bisa punya implementasi uniknya sendiri
- Code reusability - parent methods bisa di-extend tanpa di-copy
- Runtime polymorphism - tipe yang sebenarnya ditentukan saat runtime

---

## 4. Interface (Kontrak)

### Deskripsi

Interface mendefinisikan kontrak yang harus diimplementasikan oleh class yang implement interface tersebut.

### Implementasi

#### IEntity Interface

```javascript
class IEntity {
  getId() {
    throw new Error("getId() must be implemented");
  }

  validate() {
    throw new Error("validate() must be implemented");
  }

  toJSON() {
    throw new Error("toJSON() must be implemented");
  }
}
```

#### IRepository Interface

```javascript
class IRepository {
  create(data, callback) {
    throw new Error("create() must be implemented");
  }

  getAll(callback) {
    throw new Error("getAll() must be implemented");
  }

  getById(id, callback) {
    throw new Error("getById() must be implemented");
  }

  update(id, data, callback) {
    throw new Error("update() must be implemented");
  }

  delete(id, callback) {
    throw new Error("delete() must be implemented");
  }
}
```

#### Implementation

```javascript
class BoardRepository extends IRepository {
  create(data, callback) {
    // Implementation
  }

  getAll(callback) {
    // Implementation
  }

  // ... implement semua methods
}
```

**Keuntungan:**

- Contract - class yang implement interface dijamin punya semua methods
- Dependency injection - code bisa depend on interface, bukan concrete class
- Testability - mudah membuat mock objects yang implement same interface

---

## 5. Method Overloading (melalui Default Parameters)

### Deskripsi

Method overloading di JavaScript diimplementasikan menggunakan default parameters dan flexible arguments.

### Implementasi

#### Task Constructor - Multiple Ways to Create

```javascript
class Task extends Entity {
  constructor(
    id = null, // Default: null
    nama = "", // Default: empty string
    position = 0, // Default: 0
    board_id = null, // Default: null
    createdAt = new Date(), // Default: current date
    updatedAt = new Date() // Default: current date
  ) {
    super(id, createdAt, updatedAt);
    this._nama = nama;
    this._position = position;
    this._board_id = board_id;
  }
}
```

#### Usage Examples

```javascript
// Create dengan semua parameters
const task1 = new Task(1, "Fix bug", 1, 5);

// Create dengan partial parameters
const task2 = new Task(null, "New task", 1, 1);

// Create minimal
const task3 = new Task(); // All defaults
```

#### Repository Methods - Flexible Parameters

```javascript
class BoardRepository extends IRepository {
  create(data, callback) {
    // data bisa berisi: { nama: string }
    // atau bisa extended: { nama: string, description: string }
  }
}
```

**Keuntungan:**

- Flexibility - method bisa di-call dengan berbagai jumlah parameters
- Backward compatibility - old code masih work dengan new signature
- Clean API - tidak perlu buat method berbeda untuk setiap kombinasi parameters

---

## 6. Access Modifiers

### Deskripsi

JavaScript menggunakan underscore convention untuk menandai private properties, walaupun tidak sepenuhnya private.

### Implementasi

```javascript
class Entity {
  // Private (convention: underscore prefix)
  _id = null;
  _createdAt = null;
  _updatedAt = null;

  // Public methods
  getId() {
    return this._id;
  }
  setId(id) {
    this._id = id;
  }

  // Protected (hanya accessible di class dan child class)
  validate() {
    throw new Error("Must be implemented");
  }
}

class Board extends Entity {
  // Board-specific private property
  _nama = "";

  // Public getter/setter
  getNama() {
    return this._nama;
  }
  setNama(nama) {
    this._nama = nama;
  }

  // Can access parent's protected method
  validate() {
    return this._nama.trim() !== "";
  }

  // Can access parent's private properties via getter
  setCreatedAt(date) {
    this._createdAt = date;
  }
}
```

**Conventions:**

- `_property` = Private (underscore prefix)
- `property` = Public
- Protected methods = super.methodName()

---

## 7. Class Hierarchy

```
Entity (Abstract Base)
├── Board (Concrete)
│   └── BoardRepository implements IRepository
└── Task (Concrete)
    └── TaskRepository implements IRepository

BaseController (Abstract Base)
├── BoardController
└── TaskController
```

---

## 8. Validation Example

### Type Safety dengan Getter/Setter

```javascript
class Board extends Entity {
  setNama(nama) {
    // Type checking
    if (typeof nama !== "string") {
      throw new TypeError("Nama must be a string");
    }

    // Business logic validation
    if (nama.trim() === "") {
      throw new TypeError("Nama cannot be empty");
    }

    this._nama = nama.trim();
  }
}

class Task extends Entity {
  setPosition(position) {
    // Type and range checking
    if (!Number.isInteger(position)) {
      throw new TypeError("Position must be an integer");
    }

    if (position < 0) {
      throw new TypeError("Position must be non-negative");
    }

    this._position = position;
  }

  setBoardId(board_id) {
    // Type and range checking
    if (typeof board_id !== "number" || board_id <= 0) {
      throw new TypeError("Board ID must be positive number");
    }

    this._board_id = board_id;
  }
}
```

---

## Summary

| Principle            | Implementation                           | Benefit                           |
| -------------------- | ---------------------------------------- | --------------------------------- |
| **Encapsulation**    | Private properties dengan getter/setter  | Protect data, validate input      |
| **Inheritance**      | Entity as base, Board/Task extend Entity | Code reuse, consistency           |
| **Polymorphism**     | Method override di child classes         | Flexibility, extensibility        |
| **Interface**        | IEntity, IRepository contracts           | Contract enforcement, testability |
| **Overloading**      | Default parameters                       | Flexible API, backward compat     |
| **Access Modifiers** | Underscore convention                    | Hide implementation details       |
