const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");

// Create Board
router.post("/", boardController.create);

// Get all Boards
router.get("/", boardController.getAll);

// Get Board by ID
router.get("/:id", boardController.getById);

// Update Board
router.put("/:id", boardController.update);

// Delete Board
router.delete("/:id", boardController.delete);

module.exports = router;
