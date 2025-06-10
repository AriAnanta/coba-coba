/**
 * Consumer Routes
 *
 * Defines API endpoints for consumer service
 */
const express = require("express");
const router = express.Router();
const {
  verifyToken,
  checkRole,
} = require("../../../common/middleware/auth.middleware");
const { processQueueMessage } = require("../services/consumer");

/**
 * @route POST /api/consumer/machine-update
 * @desc Menerima update dari Machine Queue secara manual
 * @access Private
 */
router.post("/machine-update", async (req, res) => {
  try {
    // Validasi input
    if (!req.body.queueId || !req.body.status) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap. queueId dan status diperlukan.",
      });
    }

    // Proses pesan seperti yang dilakukan oleh consumer
    await processQueueMessage({
      content: Buffer.from(JSON.stringify(req.body)),
    });

    return res.status(200).json({
      success: true,
      message: "Update dari Machine Queue berhasil diproses",
      data: req.body,
    });
  } catch (error) {
    console.error("Error memproses update dari Machine Queue:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses update dari Machine Queue",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

/**
 * @route GET /api/consumer/status
 * @desc Mendapatkan status consumer
 * @access Private
 */
router.get("/status", (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Consumer status",
      data: {
        status: "running",
        queueName: process.env.QUEUE_NAME || "machine_queue_updates",
        rabbitMqUrl: process.env.RABBITMQ_URL ? "configured" : "not configured",
      },
    });
  } catch (error) {
    console.error("Error mendapatkan status consumer:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mendapatkan status consumer",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
