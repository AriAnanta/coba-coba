/**
 * Routes API Planning
 *
 * Mengelola endpoint API untuk perencanaan produksi
 */
const express = require("express");
const { Router } = require("express");
const planningController = require("../controllers/planning.controller");

// Middleware untuk verifikasi token JWT
// const verifyToken = require("../../../common/middleware/auth.middleware"); // Biarkan baris ini tetapi tidak digunakan

const router = Router();

// Mendapatkan semua rencana produksi
router.get("/plans", /* verifyToken, */ planningController.getAllPlans);

// Mendapatkan detail rencana produksi berdasarkan ID
router.get("/plans/:id", /* verifyToken, */ planningController.getPlanById);

// Membuat rencana produksi baru
router.post("/plans", /* verifyToken, */ planningController.createPlan);

// Memperbarui rencana produksi
router.put("/plans/:id", /* verifyToken, */ planningController.updatePlan);

// Menghapus rencana produksi
router.delete("/plans/:id", /* verifyToken, */ planningController.deletePlan);

// Menyetujui rencana produksi
router.post(
  "/plans/:id/approve",
  /* verifyToken, */ planningController.approvePlan
);

// Endpoint untuk menerima notifikasi permintaan produksi baru
router.post("/notifications/request", planningController.receiveNotification);

// Endpoint untuk menerima pembaruan permintaan produksi
router.post("/notifications/update", planningController.receiveUpdate);

module.exports = router;
