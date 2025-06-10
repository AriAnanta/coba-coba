/**
 * Production Controller
 *
 * Handles operations related to production requests
 */
const { ProductionRequest, ProductionBatch } = require("../models");
const axios = require("axios");

/**
 * Get all production requests
 */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ProductionRequest.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching production requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get production request by ID
 */
exports.getRequestById = async (req, res) => {
  try {
    const request = await ProductionRequest.findByPk(req.params.id, {
      include: [
        {
          model: ProductionBatch,
          as: "batches",
        },
      ],
    });

    if (!request) {
      return res.status(404).json({ message: "Production request not found" });
    }

    return res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching production request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a new production request (can be used for external ingestion)
 */
exports.createRequest = async (req, res) => {
  try {
    const { requestId, productName, quantity, priority } = req.body;

    // Check if requestId already exists
    const existingRequest = await ProductionRequest.findOne({
      where: { requestId },
    });
    if (existingRequest) {
      return res
        .status(409)
        .json({ message: "Production Request with this ID already exists." });
    }

    // Create the production request
    const newRequest = await ProductionRequest.create({
      requestId,
      productName,
      quantity,
      priority,
      status: "received",
    });

    // Notify the Production Planning Service about the new request
    try {
      await axios.post(
        `${process.env.PLANNING_SERVICE_URL}/api/planning/notify`,
        {
          requestId: newRequest.id,
          priority: newRequest.priority,
        }
      );
    } catch (error) {
      console.error("Failed to notify Planning Service:", error.message);
      // Continue execution even if notification fails
    }

    return res.status(201).json({
      message: "Production request created successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating production request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a production request
 */
exports.updateRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { productName, quantity, priority, status } = req.body;

    // Find the request
    const request = await ProductionRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ message: "Production request not found" });
    }

    // Update fields
    const updateData = {};
    if (productName) updateData.productName = productName;
    if (quantity) updateData.quantity = quantity;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;

    // Update request
    await request.update(updateData);

    // If status or priority changed, notify the Planning Service
    if (priority || status) {
      try {
        await axios.post(
          `${process.env.PLANNING_SERVICE_URL}/api/planning/update`,
          {
            requestId: request.id,
            priority: request.priority,
            status: request.status,
          }
        );
      } catch (error) {
        console.error(
          "Failed to notify Planning Service of update:",
          error.message
        );
        // Continue execution even if notification fails
      }
    }

    return res.status(200).json({
      message: "Production request updated successfully",
      request: request,
    });
  } catch (error) {
    console.error("Error updating production request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a production request
 */
exports.deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    // Find the request
    const request = await ProductionRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ message: "Production request not found" });
    }

    // Check if there are associated batches
    const batches = await ProductionBatch.findAll({
      where: { requestId: request.id },
    });

    if (batches.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete request with associated batches. Cancel the request instead.",
      });
    }

    // Delete the request
    await request.destroy();

    return res.status(200).json({
      message: "Production request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting production request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Cancel a production request
 */
exports.cancelRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    // Find the request
    const request = await ProductionRequest.findByPk(requestId, {
      include: [
        {
          model: ProductionBatch,
          as: "batches",
        },
      ],
    });

    if (!request) {
      return res.status(404).json({ message: "Production request not found" });
    }

    // Update request status
    await request.update({ status: "cancelled" });

    // Update associated batches
    if (request.batches && request.batches.length > 0) {
      for (const batch of request.batches) {
        await batch.update({ status: "cancelled" });

        // Notify the Machine Queue Service
        try {
          await axios.post(
            `${process.env.MACHINE_QUEUE_URL}/api/queue/cancel`,
            {
              batchId: batch.id,
            }
          );
        } catch (error) {
          console.error(
            "Failed to notify Machine Queue Service:",
            error.message
          );
          // Continue execution even if notification fails
        }
      }
    }

    // Notify the Production Feedback Service
    try {
      await axios.post(
        `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
        {
          requestId: request.requestId,
          status: "cancelled",
          notes: "Request cancelled by user",
        }
      );
    } catch (error) {
      console.error("Failed to notify Feedback Service:", error.message);
      // Continue execution even if notification fails
    }

    return res.status(200).json({
      message: "Production request cancelled successfully",
      request: request,
    });
  } catch (error) {
    console.error("Error cancelling production request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
