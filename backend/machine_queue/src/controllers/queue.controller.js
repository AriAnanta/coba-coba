/**
 * Queue Controller
 * Handles machine queue operations
 */
const { MachineQueue, Machine } = require("../models");
const { Op } = require("sequelize");

/**
 * Get all queue items
 */
exports.getAllQueues = async (req, res) => {
  try {
    const { status, machineId, batchId } = req.query;

    // Build filter - use snake_case for database fields
    const where = {};
    if (status) where.status = status;
    if (machineId) where.machine_id = machineId;
    if (batchId) where.batch_id = batchId;

    const queues = await MachineQueue.findAll({
      where,
      include: [
        {
          model: Machine,
          as: "machine",
          required: false,
        },
      ],
      order: [
        ["status", "ASC"],
        ["priority", "DESC"],
        ["position", "ASC"],
        ["scheduled_start_time", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: queues,
    });
  } catch (error) {
    console.error("Error fetching queue items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get queue item by ID
 */
exports.getQueueById = async (req, res) => {
  try {
    const queue = await MachineQueue.findByPk(req.params.id, {
      include: [
        {
          model: Machine,
          as: "machine",
          required: false,
        },
      ],
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (error) {
    console.error("Error fetching queue item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Add item to queue
 */
exports.addToQueue = async (req, res) => {
  try {
    const {
      machineId,
      batchId,
      batchNumber,
      productName,
      stepId,
      stepName,
      scheduledStartTime,
      scheduledEndTime,
      hoursRequired,
      priority,
      operatorId,
      operatorName,
      setupTime,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !machineId ||
      !batchId ||
      !batchNumber ||
      !productName ||
      !hoursRequired
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields: machineId, batchId, batchNumber, productName, hoursRequired",
      });
    }

    // Check if machine exists and is operational
    const machine = await Machine.findByPk(machineId);
    if (!machine) {
      return res.status(404).json({
        success: false,
        message: "Machine not found",
      });
    }

    if (machine.status !== "operational") {
      return res.status(400).json({
        success: false,
        message: "Machine is not operational",
      });
    }

    // Calculate position in queue
    const queueCount = await MachineQueue.count({
      where: {
        machine_id: machineId,
        status: {
          [Op.in]: ["waiting", "in_progress"],
        },
      },
    });

    // Generate unique queue ID
    const queueId = `QUEUE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newQueue = await MachineQueue.create({
      queue_id: queueId,
      machine_id: machineId,
      batch_id: batchId,
      batch_number: batchNumber,
      product_name: productName,
      step_id: stepId,
      step_name: stepName,
      scheduled_start_time: scheduledStartTime
        ? new Date(scheduledStartTime)
        : null,
      scheduled_end_time: scheduledEndTime ? new Date(scheduledEndTime) : null,
      hours_required: hoursRequired,
      priority: priority || "normal",
      operator_id: operatorId,
      operator_name: operatorName,
      setup_time: setupTime,
      position: queueCount + 1,
      status: "waiting",
      notes,
    });

    // Include machine data in response
    const queueWithMachine = await MachineQueue.findByPk(newQueue.id, {
      include: [
        {
          model: Machine,
          as: "machine",
          required: false,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Item added to queue successfully",
      data: queueWithMachine,
    });
  } catch (error) {
    console.error("Error adding to queue:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update queue item
 */
exports.updateQueue = async (req, res) => {
  try {
    const queue = await MachineQueue.findByPk(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue item not found",
      });
    }

    // Update allowed fields
    const allowedFields = [
      "scheduledStartTime",
      "scheduledEndTime",
      "hoursRequired",
      "priority",
      "operatorId",
      "operatorName",
      "setupTime",
      "notes",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field.includes("Time") && req.body[field]) {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    await queue.update(updateData);

    const updatedQueue = await MachineQueue.findByPk(queue.id, {
      include: [
        {
          model: Machine,
          as: "machine",
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Queue item updated successfully",
      data: updatedQueue,
    });
  } catch (error) {
    console.error("Error updating queue item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Remove item from queue
 */
exports.removeFromQueue = async (req, res) => {
  try {
    const queue = await MachineQueue.findByPk(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue item not found",
      });
    }

    // Don't allow deletion of in-progress items
    if (queue.status === "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete queue item that is in progress",
      });
    }

    await queue.destroy();

    // Reorder remaining queue items
    await this.reorderMachineQueue(queue.machineId);

    res.status(200).json({
      success: true,
      message: "Queue item removed successfully",
    });
  } catch (error) {
    console.error("Error removing queue item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get available machines
 */
exports.getAvailableMachines = async (req, res) => {
  try {
    const machines = await Machine.findAll({
      where: {
        status: "operational",
      },
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: machines,
    });
  } catch (error) {
    console.error("Error fetching available machines:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get queue for specific machine
 */
exports.getMachineQueue = async (req, res) => {
  try {
    const machineId = req.params.machineId;

    const machine = await Machine.findByPk(machineId);
    if (!machine) {
      return res.status(404).json({
        success: false,
        message: "Machine not found",
      });
    }

    const machineQueue = await MachineQueue.findAll({
      where: { machine_id: machineId },
      include: [
        {
          model: Machine,
          as: "machine",
          required: false,
        },
      ],
      order: [
        ["status", "ASC"],
        ["position", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: machineQueue,
      machine: machine,
    });
  } catch (error) {
    console.error("Error fetching machine queue:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Start queue item
 */
exports.startQueueItem = async (req, res) => {
  try {
    const queue = await MachineQueue.findByPk(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue item not found",
      });
    }

    if (queue.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Queue item must be in waiting status to start",
      });
    }

    // Check if there's already an in-progress item on this machine
    const inProgressItem = await MachineQueue.findOne({
      where: {
        machineId: queue.machineId,
        status: "in_progress",
      },
    });

    if (inProgressItem) {
      return res.status(400).json({
        success: false,
        message: "Machine already has an item in progress",
      });
    }

    await queue.update({
      status: "in_progress",
      actualStartTime: new Date(),
      position: 0,
      operatorId: req.body.operatorId || queue.operatorId,
      operatorName: req.body.operatorName || queue.operatorName,
    });

    const updatedQueue = await MachineQueue.findByPk(queue.id, {
      include: [
        {
          model: Machine,
          as: "machine",
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Queue item started successfully",
      data: updatedQueue,
    });
  } catch (error) {
    console.error("Error starting queue item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Complete queue item
 */
exports.completeQueueItem = async (req, res) => {
  try {
    const queue = await MachineQueue.findByPk(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue item not found",
      });
    }

    if (queue.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Queue item must be in progress to complete",
      });
    }

    await queue.update({
      status: "completed",
      actualEndTime: new Date(),
      notes: req.body.notes || queue.notes,
    });

    // Reorder remaining queue items
    await this.reorderMachineQueue(queue.machineId);

    const updatedQueue = await MachineQueue.findByPk(queue.id, {
      include: [
        {
          model: Machine,
          as: "machine",
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Queue item completed successfully",
      data: updatedQueue,
    });
  } catch (error) {
    console.error("Error completing queue item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Cancel queue item
 */
exports.cancelQueueItem = async (req, res) => {
  try {
    const queue = await MachineQueue.findByPk(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue item not found",
      });
    }

    if (queue.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed queue item",
      });
    }

    await queue.update({
      status: "cancelled",
      notes: req.body.reason || queue.notes,
    });

    // Reorder remaining queue items
    await this.reorderMachineQueue(queue.machineId);

    const updatedQueue = await MachineQueue.findByPk(queue.id, {
      include: [
        {
          model: Machine,
          as: "machine",
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Queue item cancelled successfully",
      data: updatedQueue,
    });
  } catch (error) {
    console.error("Error cancelling queue item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Helper function to reorder queue positions
 */
exports.reorderMachineQueue = async (machineId) => {
  try {
    const waitingQueues = await MachineQueue.findAll({
      where: {
        machineId,
        status: "waiting",
      },
      order: [
        ["position", "ASC"],
        ["priority", "DESC"],
        ["createdAt", "ASC"],
      ],
    });

    for (let i = 0; i < waitingQueues.length; i++) {
      await waitingQueues[i].update({ position: i + 1 });
    }
  } catch (error) {
    console.error("Error reordering queue:", error);
  }
};

/**
 * Add multiple batch steps to queue
 */
exports.addBatchStepsToQueue = async (req, res) => {
  try {
    const {
      batchId,
      batchNumber,
      productName,
      priority, // Priority from the batch/request
      steps,
    } = req.body;

    if (
      !batchId ||
      !batchNumber ||
      !productName ||
      !steps ||
      !Array.isArray(steps) ||
      steps.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields: batchId, batchNumber, productName, steps (array)",
      });
    }

    const createdQueues = [];

    for (const step of steps) {
      const {
        stepId, // This is the ID of the ProductionStep from Production Management
        stepName,
        machineId,
        scheduledStartTime,
        scheduledEndTime,
      } = step;

      // Basic validation for step data
      if (!machineId || !stepName) {
        console.warn(
          "Skipping step due to missing machineId or stepName:",
          step
        );
        continue; // Skip invalid steps
      }

      // Check if machine exists and is operational
      const machine = await Machine.findByPk(machineId);
      if (!machine) {
        console.warn(
          `Machine with ID ${machineId} not found for step ${stepName}. Skipping.`
        );
        continue; // Skip step if machine is not found
      }

      if (machine.status !== "operational") {
        console.warn(
          `Machine ${machine.name} (ID: ${machineId}) is not operational for step ${stepName}. Skipping.`
        );
        continue; // Skip step if machine is not operational
      }

      // Calculate position in queue for the specific machine
      // For simplicity, new items go to the end of the waiting queue for that machine
      const maxPosition =
        (await MachineQueue.max("position", {
          where: {
            machine_id: machineId,
            status: { [Op.in]: ["waiting", "in_progress"] },
          },
        })) || 0;

      // Generate unique queue ID for each step
      const queueId = `QUEUE-${batchNumber}-${stepId}`;

      const newQueue = await MachineQueue.create({
        queue_id: queueId,
        machine_id: machineId,
        batch_id: batchId,
        batch_number: batchNumber,
        product_name: productName,
        step_id: stepId,
        step_name: stepName,
        scheduled_start_time: scheduledStartTime
          ? new Date(scheduledStartTime)
          : null,
        scheduled_end_time: scheduledEndTime
          ? new Date(scheduledEndTime)
          : null,
        hours_required: 1.0, // Default for now, can be passed from Production Management
        priority: priority || "normal", // Use batch priority or default to normal
        position: maxPosition + 1,
        status: "waiting", // Default status
        // operatorId and operatorName can be added if available from Production Management
      });

      createdQueues.push(newQueue);
    }

    if (createdQueues.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid steps were added to the queue.",
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully added ${createdQueues.length} steps to queue`,
      data: createdQueues,
    });
  } catch (error) {
    console.error("Error adding batch steps to queue:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update queue item status generically
 */
exports.updateQueueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, operatorId, operatorName, notes } = req.body;

    const queue = await MachineQueue.findByPk(id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue item not found",
      });
    }

    const updateData = {};

    switch (status) {
      case "in_progress":
        if (queue.status !== "waiting") {
          return res.status(400).json({
            success: false,
            message: "Queue item must be in waiting status to start",
          });
        }
        // Check if machine has any active jobs
        const activeJobOnMachine = await MachineQueue.findOne({
          where: {
            machine_id: queue.machine_id,
            status: "in_progress",
          },
        });
        if (activeJobOnMachine) {
          return res.status(400).json({
            success: false,
            message: "Machine already has an active job",
          });
        }
        updateData.status = "in_progress";
        updateData.actual_start_time = new Date();
        updateData.position = 0;
        if (operatorId) updateData.operator_id = operatorId;
        if (operatorName) updateData.operator_name = operatorName;
        break;
      case "completed":
        if (queue.status !== "in_progress") {
          return res.status(400).json({
            success: false,
            message: "Queue item must be in progress to complete",
          });
        }
        updateData.status = "completed";
        updateData.actual_end_time = new Date();
        if (notes) updateData.notes = notes;
        break;
      case "cancelled":
        if (queue.status === "completed") {
          return res.status(400).json({
            success: false,
            message: "Cannot cancel a completed queue item",
          });
        }
        updateData.status = "cancelled";
        if (notes) updateData.notes = notes;
        break;
      case "paused":
        if (queue.status !== "in_progress") {
          return res.status(400).json({
            success: false,
            message: "Queue item must be in progress to pause",
          });
        }
        updateData.status = "paused";
        if (notes) updateData.notes = notes;
        break;
      case "waiting": // Allow transition back to waiting, e.g., from paused
        if (
          queue.status === "in_progress" ||
          queue.status === "completed" ||
          queue.status === "cancelled"
        ) {
          return res.status(400).json({
            success: false,
            message: `Cannot change status from ${queue.status} to waiting`,
          });
        }
        updateData.status = "waiting";
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid status provided",
        });
    }

    await queue.update(updateData);

    // If status changed to completed, reorder remaining waiting items for that machine
    if (status === "completed") {
      await this.reorderMachineQueue(queue.machine_id);
    }

    res.status(200).json({
      success: true,
      message: `Queue item status updated to ${status}`,
      data: queue,
    });
  } catch (error) {
    console.error("Error updating queue item status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get queue items by batch ID
 */
exports.getQueuesByBatchId = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { status } = req.query;

    // Build filter
    const where = { batch_id: batchId };
    if (status) where.status = status;

    const queues = await MachineQueue.findAll({
      where,
      include: [
        {
          model: Machine,
          as: "machine",
          required: false,
        },
      ],
      order: [
        ["updated_at", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: queues,
    });
  } catch (error) {
    console.error("Error fetching queue items by batch ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
