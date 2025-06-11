/**
 * User Routes
 *
 * Routes for user management operations
 */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Definisi lokal untuk middleware auth
const verifyToken = (req, res, next) => {
  // Implementasi sederhana untuk sementara
  console.log("Token verification bypassed in development");
  req.user = { id: 1, role: "admin" }; // User dummy
  next();
};

const requireRole = (role) => {
  return (req, res, next) => {
    console.log("Role check bypassed in development");
    next();
  };
};

// Basic user controller functions (temporary until controller is created)
const userController = {
  getAllUsers: (req, res) => {
    res.json({ message: "Get all users", user: req.user });
  },
  getUserById: (req, res) => {
    res.json({ message: `Get user ${req.params.id}`, user: req.user });
  },
  createUser: (req, res) => {
    res.json({ message: "Create user", user: req.user });
  },
  updateUser: (req, res) => {
    res.json({ message: `Update user ${req.params.id}`, user: req.user });
  },
  deleteUser: (req, res) => {
    res.json({ message: `Delete user ${req.params.id}`, user: req.user });
  },
};

// Routes
router.get("/", verifyToken, requireRole("admin"), userController.getAllUsers);
router.get("/:id", verifyToken, userController.getUserById);
router.post("/", verifyToken, requireRole("admin"), userController.createUser);
router.put("/:id", verifyToken, userController.updateUser);
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  userController.deleteUser
);

module.exports = router;
