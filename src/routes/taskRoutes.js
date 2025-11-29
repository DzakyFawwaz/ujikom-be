const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Create Task
router.post("/", taskController.create);

// Get all Tasks
router.get("/", taskController.getAll);

// Reorder - Swap positions between two tasks (must come before /:id routes)
router.post("/reorder", taskController.reorder);

// Move - Move task to different board (must come before /:id routes)
router.post("/move", taskController.move);

// Reorder by position - Change task position within a board (must come before /:id routes)
router.put("/:id/reorder-position", taskController.reorderByPosition);

// Get Tasks by Board ID
router.get("/board/:board_id", taskController.getByBoardId);

// Get Task by ID
router.get("/:id", taskController.getById);

// Update Task
router.put("/:id", taskController.update);

// Delete Task
router.delete("/:id", taskController.delete);

module.exports = router;
