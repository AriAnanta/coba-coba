/**
 * Routes API Antrian Mesin
 *
 * Mendefinisikan endpoint API untuk pengelolaan antrian mesin
 */
const express = require("express");
const queueController = require("../controllers/queue.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { MachineQueue } = require("../models");

const router = express.Router();

// Terapkan middleware otentikasi untuk semua route
// router.use(authMiddleware); // Hapus middleware otentikasi dari semua rute API

// Queue management routes
router.get("/queues", queueController.getAllQueues);
router.get("/queues/batch/:batchId", queueController.getQueuesByBatchId); // New route for getting queues by batch ID
router.get("/queues/:id", queueController.getQueueById);
router.post("/queues", queueController.addToQueue); // Changed from /queues/add
router.put("/queues/:id", queueController.updateQueue);
router.delete("/queues/:id", queueController.removeFromQueue);

// Machine availability routes
router.get("/machines/available", queueController.getAvailableMachines);
router.get("/machines/:machineId/queue", queueController.getMachineQueue);

// Queue status routes
router.put("/queues/:id/start", queueController.startQueueItem);
router.put("/queues/:id/complete", queueController.completeQueueItem);
router.put("/queues/:id/cancel", queueController.cancelQueueItem);

// New route for generic status update
router.patch("/queues/:id/status", queueController.updateQueueStatus);

// Additional queue management routes
router.post("/queues/:id/reorder", async (req, res) => {
  try {
    const { newPosition } = req.body;

    const queue = await MachineQueue.findByPk(req.params.id);

    if (!queue) {
      return res
        .status(404)
        .json({ success: false, message: "Queue item not found" });
    }

    if (queue.status !== "waiting") {
      return res
        .status(400)
        .json({ success: false, message: "Can only reorder waiting items" });
    }

    await queue.update({ position: newPosition });
    await queueController.reorderMachineQueue(queue.machineId);

    res
      .status(200)
      .json({ success: true, message: "Queue reordered successfully" });
  } catch (error) {
    console.error("Error reordering queue:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// New endpoint for adding multiple steps for a batch
router.post("/add-batch-steps", queueController.addBatchStepsToQueue);

module.exports = router;
