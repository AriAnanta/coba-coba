/**
 * Batch Controller
 *
 * Handles operations related to production batches
 */
const {
  ProductionBatch,
  ProductionRequest,
  ProductionStep,
  MaterialAllocation,
} = require("../models");
const axios = require("axios");
const { Op } = require("sequelize");

/**
 * Get all production batches
 */
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await ProductionBatch.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: ProductionRequest,
          as: "request",
          attributes: ["id", "requestId", "productName", "priority"],
        },
      ],
    });

    return res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching production batches:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get production batch by ID
 */
exports.getBatchById = async (req, res) => {
  try {
    const batch = await ProductionBatch.findByPk(req.params.id, {
      include: [
        {
          model: ProductionRequest,
          as: "request",
        },
        {
          model: ProductionStep,
          as: "steps",
          order: [["stepOrder", "ASC"]],
        },
        {
          model: MaterialAllocation,
          as: "materialAllocations",
          attributes: [
            "id",
            ["batch_id", "batchId"],
            "materialId",
            "quantityRequired",
            "quantityAllocated",
            "unitOfMeasure",
            "status",
            "allocationDate",
            "notes",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    return res.status(200).json(batch);
  } catch (error) {
    console.error("Error fetching production batch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a new production batch
 */
exports.createBatch = async (req, res) => {
  try {
    const {
      requestId,
      quantity,
      scheduledStartDate,
      scheduledEndDate,
      notes,
      steps,
      materials,
    } = req.body;

    // Find the production request
    const request = await ProductionRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ message: "Production request not found" });
    }

    // Generate batch number
    const batchNumber = `B${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the production batch
    const newBatch = await ProductionBatch.create({
      batchNumber,
      request_id: request.id,
      quantity,
      scheduledStartDate,
      scheduledEndDate,
      notes,
      status: "pending",
    });

    // Create production steps if provided
    if (steps && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await ProductionStep.create({
          batch_id: newBatch.id,
          stepName: step.stepName,
          stepOrder: i + 1,
          machineType: step.machineType,
          scheduledStartTime: step.scheduledStartTime,
          scheduledEndTime: step.scheduledEndTime,
          status: "pending",
        });
      }
    }

    // Create material allocations if provided
    if (materials && materials.length > 0) {
      for (const material of materials) {
        await MaterialAllocation.create({
          batch_id: newBatch.id,
          materialId: material.materialId,
          quantityRequired: material.quantityRequired,
          unitOfMeasure: material.unitOfMeasure,
          status: "pending",
        });
      }
    }

    // Update the request status to 'planned'
    await request.update({ status: "planned" });

    // Notify the Material Inventory Service
    try {
      if (materials && materials.length > 0) {
        await axios.post(
          `${process.env.MATERIAL_INVENTORY_URL}/api/inventory/reserve`,
          {
            batchId: newBatch.id,
            materials: materials,
          }
        );
      }
    } catch (error) {
      console.error(
        "Failed to notify Material Inventory Service:",
        error.message
      );
      // Continue execution even if notification fails
    }

    // Notify the Machine Queue Service
    try {
      if (steps && steps.length > 0) {
        await axios.post(`${process.env.MACHINE_QUEUE_URL}/api/queue/add`, {
          batchId: newBatch.id,
          batchNumber: newBatch.batchNumber,
          requestId: request.requestId,
          productName: request.productName,
          priority: request.priority,
          steps: steps.map((s, i) => ({
            stepId: i + 1,
            stepName: s.stepName,
            machineType: s.machineType,
            scheduledStartTime: s.scheduledStartTime,
            scheduledEndTime: s.scheduledEndTime,
          })),
        });
      }
    } catch (error) {
      console.error("Failed to notify Machine Queue Service:", error.message);
      // Continue execution even if notification fails
    }

    // Return the created batch with associations
    return await ProductionBatch.findByPk(newBatch.id, {
      include: [
        {
          model: ProductionRequest,
          as: "request",
        },
        {
          model: ProductionStep,
          as: "steps",
          order: [["stepOrder", "ASC"]],
        },
        {
          model: MaterialAllocation,
          as: "materialAllocations",
          attributes: [
            "id",
            ["batch_id", "batchId"],
            "materialId",
            "quantityRequired",
            "quantityAllocated",
            "unitOfMeasure",
            "status",
            "allocationDate",
            "notes",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Error creating production batch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a production batch
 */
exports.updateBatch = async (req, res) => {
  try {
    const batchId = req.params.id;
    const { scheduledStartDate, scheduledEndDate, status, notes, quantity } =
      req.body;

    // Find the batch
    const batch = await ProductionBatch.findByPk(batchId);

    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    // Update fields
    const updateData = {};
    if (scheduledStartDate !== undefined)
      updateData.scheduledStartDate = scheduledStartDate;
    if (scheduledEndDate !== undefined)
      updateData.scheduledEndDate = scheduledEndDate;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (quantity) updateData.quantity = quantity;

    // Update batch
    await batch.update(updateData);

    return res.status(200).json({
      message: "Production batch updated successfully",
      batch: batch,
    });
  } catch (error) {
    console.error("Error updating production batch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get production steps for a batch
 */
exports.getBatchSteps = async (req, res) => {
  try {
    const batchId = req.params.batchId;
    const steps = await ProductionStep.findAll({
      where: { batch_id: batchId },
      order: [["stepOrder", "ASC"]],
    });

    return res.status(200).json(steps);
  } catch (error) {
    console.error("Error fetching batch steps:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a new production step
 */
exports.createProductionStep = async (req, res) => {
  try {
    const batchId = req.params.batchId;
    const {
      stepName,
      stepOrder,
      machineType,
      scheduledStartTime,
      scheduledEndTime,
      notes,
    } = req.body;

    const newStep = await ProductionStep.create({
      batch_id: batchId,
      stepName,
      stepOrder,
      machineType,
      scheduledStartTime,
      scheduledEndTime,
      notes,
      status: "pending",
    });

    return res.status(201).json({ message: "Step created", step: newStep });
  } catch (error) {
    console.error("Error creating production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a production step
 */
exports.updateProductionStep = async (req, res) => {
  try {
    const stepId = req.params.stepId;
    const { machineId, operatorId, status, notes } = req.body;

    // Find the step
    const step = await ProductionStep.findByPk(stepId);

    if (!step) {
      return res.status(404).json({ message: "Production step not found" });
    }

    // Update fields
    const updateData = {};
    if (machineId) updateData.machineId = machineId;
    if (operatorId) updateData.operatorId = operatorId;
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    // Update step
    await step.update(updateData);

    // If step status changed to 'in_progress', update batch status if it's the first step
    if (status === "in_progress") {
      const batch = await ProductionBatch.findByPk(step.batch_id);
      if (batch && batch.status !== "in_progress") {
        // Check if this is the first step
        const steps = await ProductionStep.findAll({
          where: { batch_id: step.batch_id },
          order: [["stepOrder", "ASC"]],
        });

        if (steps[0].id === step.id) {
          await batch.update({
            status: "in_progress",
          });

          // Update the request status
          const request = await ProductionRequest.findByPk(batch.request_id);
          if (request) {
            await request.update({ status: "in_production" });
          }
        }
      }
    }

    // If step status changed to 'completed', check if all steps are completed to update batch status
    if (status === "completed") {
      const batch = await ProductionBatch.findByPk(step.batch_id);
      if (batch) {
        const steps = await ProductionStep.findAll({
          where: { batch_id: step.batch_id },
        });

        const allCompleted = steps.every(
          (s) => s.status === "completed" || s.status === "cancelled"
        );

        if (allCompleted) {
          await batch.update({
            status: "completed",
          });

          // Check if all batches for this request are completed
          const allBatches = await ProductionBatch.findAll({
            where: { request_id: batch.request_id },
          });

          const allBatchesCompleted = allBatches.every(
            (b) => b.status === "completed" || b.status === "cancelled"
          );

          if (allBatchesCompleted) {
            const request = await ProductionRequest.findByPk(batch.request_id);
            if (request) {
              await request.update({ status: "completed" });

              // Notify the Production Feedback Service
              try {
                await axios.post(
                  `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
                  {
                    requestId: request.requestId,
                    status: "completed",
                    notes: "All production completed",
                  }
                );
              } catch (error) {
                console.error(
                  "Failed to notify Feedback Service:",
                  error.message
                );
                // Continue execution even if notification fails
              }
            }
          }
        }
      }
    }

    return res.status(200).json({
      message: "Production step updated successfully",
      step: step,
    });
  } catch (error) {
    console.error("Error updating production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a production step
 */
exports.deleteProductionStep = async (req, res) => {
  try {
    const { batchId, stepId } = req.params;

    const step = await ProductionStep.findByPk(stepId);

    if (!step) {
      return res.status(404).json({ message: "Production step not found" });
    }

    if (step.batch_id != batchId) {
      return res
        .status(400)
        .json({ message: "Step does not belong to this batch." });
    }

    await step.destroy();

    return res
      .status(200)
      .json({ message: "Production step deleted successfully" });
  } catch (error) {
    console.error("Error deleting production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Start a production step (and potentially update batch status)
 */
exports.startProduction = async (req, res) => {
  try {
    const batchId = req.params.batchId;

    const batch = await ProductionBatch.findByPk(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    if (batch.status === "in_progress") {
      return res
        .status(400)
        .json({ message: "Batch production is already in progress." });
    }

    await batch.update({
      status: "in_progress",
    });

    // Optionally update the associated request status if this is the first batch to start production
    const request = await ProductionRequest.findByPk(batch.request_id);
    if (request && request.status === "planned") {
      const otherBatches = await ProductionBatch.findAll({
        where: {
          request_id: batch.request_id,
          status: { [Op.ne]: "pending" },
        },
      });

      if (otherBatches.length === 0) {
        // This is the first batch to start production for this request
        await request.update({ status: "in_production" });

        // Notify Production Feedback Service
        try {
          await axios.post(
            `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
            {
              requestId: request.requestId,
              status: "in_production",
              notes: `Production started for batch ${batch.batchNumber}`,
            }
          );
        } catch (error) {
          console.error(
            "Failed to notify Feedback Service about production start:",
            error.message
          );
        }
      }
    }

    // Notify Machine Queue Service (if integrated for batch start)
    try {
      await axios.post(`${process.env.MACHINE_QUEUE_URL}/api/queue/start`, {
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        status: "in_progress",
      });
    } catch (error) {
      console.error("Failed to notify Machine Queue Service:", error.message);
    }

    return res.status(200).json({
      message: "Production started successfully",
      batch: batch,
    });
  } catch (error) {
    console.error("Error starting production:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Complete a production step
 */
exports.completeProductionStep = async (req, res) => {
  try {
    const { batchId, stepId } = req.params;
    const { notes } = req.body;

    const step = await ProductionStep.findByPk(stepId);
    if (!step) {
      return res.status(404).json({ message: "Production step not found" });
    }

    if (step.batch_id != batchId) {
      return res
        .status(400)
        .json({ message: "Step does not belong to this batch." });
    }

    if (step.status === "completed") {
      return res
        .status(400)
        .json({ message: "Production step is already completed." });
    }

    await step.update({
      status: "completed",
      notes: notes || step.notes,
    });

    // Check if all steps in the batch are completed
    const allBatchSteps = await ProductionStep.findAll({
      where: { batch_id: batchId },
    });

    const allStepsCompleted = allBatchSteps.every(
      (s) => s.status === "completed" || s.status === "cancelled"
    );

    if (allStepsCompleted) {
      const batch = await ProductionBatch.findByPk(batchId);
      if (batch) {
        await batch.update({
          status: "completed",
        });

        // Check if all batches for the request are completed
        const allBatches = await ProductionBatch.findAll({
          where: { request_id: batch.request_id },
        });

        const allBatchesCompleted = allBatches.every(
          (b) => b.status === "completed" || b.status === "cancelled"
        );

        if (allBatchesCompleted) {
          const request = await ProductionRequest.findByPk(batch.request_id);
          if (request) {
            await request.update({ status: "completed" });

            // Notify Production Feedback Service for request completion
            try {
              await axios.post(
                `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
                {
                  requestId: request.requestId,
                  status: "completed",
                  notes: "All production completed for this request.",
                }
              );
            } catch (error) {
              console.error(
                "Failed to notify Feedback Service about request completion:",
                error.message
              );
            }
          }
        }
      }
    }

    // Notify Machine Queue Service (if integrated for step completion)
    try {
      await axios.post(
        `${process.env.MACHINE_QUEUE_URL}/api/queue/complete-step`,
        {
          batchId: batchId,
          stepId: step.id,
          status: "completed",
        }
      );
    } catch (error) {
      console.error("Failed to notify Machine Queue Service:", error.message);
    }

    return res.status(200).json({
      message: "Production step completed successfully",
      step: step,
    });
  } catch (error) {
    console.error("Error completing production step:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get material allocations for a batch
 */
exports.getBatchMaterials = async (req, res) => {
  try {
    const { batchId } = req.params;

    const materials = await MaterialAllocation.findAll({
      where: { batch_id: batchId },
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json(materials);
  } catch (error) {
    console.error("Error fetching batch materials:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a new material allocation
 */
exports.createMaterialAllocation = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { materialId, quantityRequired, unitOfMeasure, notes } = req.body;

    console.log(
      "Menerima permintaan createMaterialAllocation untuk batchId:",
      batchId
    );
    console.log("Data yang diterima:", {
      materialId,
      quantityRequired,
      unitOfMeasure,
      notes,
    });

    // Validate batch exists
    const batch = await ProductionBatch.findByPk(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    // Check if material is already allocated to this batch
    const existingAllocation = await MaterialAllocation.findOne({
      where: { batch_id: batchId, materialId },
    });

    if (existingAllocation) {
      return res.status(400).json({
        message: "Material already allocated to this batch",
      });
    }

    const newAllocation = await MaterialAllocation.create({
      batch_id: batchId,
      materialId,
      quantityRequired,
      quantityAllocated: 0,
      unitOfMeasure,
      notes,
      status: "pending",
    });

    return res.status(201).json({
      message: "Material allocation created successfully",
      allocation: newAllocation,
    });
  } catch (error) {
    console.error("Error creating material allocation:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Update a material allocation
 */
exports.updateMaterialAllocation = async (req, res) => {
  try {
    const { batchId, allocationId } = req.params;
    const updateData = req.body;

    const allocation = await MaterialAllocation.findOne({
      where: { id: allocationId, batch_id: batchId },
    });

    if (!allocation) {
      return res.status(404).json({ message: "Material allocation not found" });
    }

    await allocation.update(updateData);

    return res.status(200).json({
      message: "Material allocation updated successfully",
      allocation: allocation,
    });
  } catch (error) {
    console.error("Error updating material allocation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a material allocation
 */
exports.deleteMaterialAllocation = async (req, res) => {
  try {
    const { batchId, allocationId } = req.params;

    const allocation = await MaterialAllocation.findOne({
      where: { id: allocationId, batch_id: batchId },
    });

    if (!allocation) {
      return res.status(404).json({ message: "Material allocation not found" });
    }

    if (allocation.status === "allocated" || allocation.status === "consumed") {
      return res.status(400).json({
        message:
          "Cannot delete allocation that is already allocated or consumed",
      });
    }

    await allocation.destroy();

    return res.status(200).json({
      message: "Material allocation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material allocation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Allocate material to batch
 */
exports.allocateMaterial = async (req, res) => {
  try {
    const { batchId, allocationId } = req.params;
    const { quantityAllocated } = req.body;

    const allocation = await MaterialAllocation.findOne({
      where: { id: allocationId, batch_id: batchId },
    });

    if (!allocation) {
      return res.status(404).json({ message: "Material allocation not found" });
    }

    if (quantityAllocated > allocation.quantityRequired) {
      return res.status(400).json({
        message: "Allocated quantity cannot exceed required quantity",
      });
    }

    const status =
      quantityAllocated >= allocation.quantityRequired
        ? "allocated"
        : "partial";

    await allocation.update({
      quantityAllocated,
      status,
      allocationDate: new Date(),
    });

    // Kurangi stok material di layanan Material Inventory
    try {
      console.log(
        `Mengirim permintaan pengurangan stok ke: ${process.env.MATERIAL_INVENTORY_URL}/api/materials/issue`
      );
      console.log("Data yang dikirim:", {
        materials: [
          {
            materialId: allocation.materialId,
            quantity: quantityAllocated,
          },
        ],
        productionOrderId: batchId,
        referenceNumber: `ALLOC-${batchId}-${allocationId}`,
        notes: `Pengeluaran material untuk alokasi batch ${batchId}`,
      });

      await axios.post(
        `${process.env.MATERIAL_INVENTORY_URL}/api/materials/issue`,
        {
          materials: [
            {
              materialId: allocation.materialId,
              quantity: quantityAllocated,
            },
          ],
          productionOrderId: batchId,
          referenceNumber: `ALLOC-${batchId}-${allocationId}`,
          notes: `Pengeluaran material untuk alokasi batch ${batchId}`,
        }
      );
      console.log(
        `Stok material ${allocation.materialId} berhasil dikurangi sebanyak ${quantityAllocated}`
      );
    } catch (materialError) {
      console.error(
        "Gagal mengurangi stok material di Material Inventory Service:",
        materialError.message
      );
      // Anda bisa memilih untuk melempar error di sini atau hanya log,
      // tergantung pada seberapa kritis pengurangan stok ini.
      // Untuk saat ini, kita akan melanjutkan, tetapi log error penting.
    }

    return res.status(200).json({
      message: "Material allocated successfully",
      allocation: allocation,
    });
  } catch (error) {
    console.error("Error allocating material:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Consume allocated material
 */
exports.consumeMaterial = async (req, res) => {
  try {
    const { batchId, allocationId } = req.params;

    const allocation = await MaterialAllocation.findOne({
      where: { id: allocationId, batch_id: batchId },
    });

    if (!allocation) {
      return res.status(404).json({ message: "Material allocation not found" });
    }

    if (allocation.status !== "allocated") {
      return res.status(400).json({
        message: "Material must be allocated before consumption",
      });
    }

    await allocation.update({
      status: "consumed",
    });

    return res.status(200).json({
      message: "Material consumed successfully",
      allocation: allocation,
    });
  } catch (error) {
    console.error("Error consuming material:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a production batch
 */
exports.deleteBatch = async (req, res) => {
  try {
    const batchId = req.params.id;

    // Find the batch
    const batch = await ProductionBatch.findByPk(batchId, {
      include: [
        {
          model: ProductionStep,
          as: "steps",
        },
        {
          model: MaterialAllocation,
          as: "materialAllocations",
        },
      ],
    });

    if (!batch) {
      return res.status(404).json({ message: "Production batch not found" });
    }

    // Check if batch is in progress or completed
    if (batch.status === "in_progress" || batch.status === "completed") {
      return res.status(400).json({
        message:
          "Cannot delete batch that is in progress or completed. Cancel the batch instead.",
      });
    }

    // Check if materials are allocated
    const allocatedMaterials = batch.materialAllocations?.some(
      (allocation) =>
        allocation.status === "allocated" || allocation.status === "consumed"
    );

    if (allocatedMaterials) {
      return res.status(400).json({
        message:
          "Cannot delete batch with allocated materials. Deallocate materials first.",
      });
    }

    // Delete the batch (cascade will handle related records)
    await batch.destroy();

    return res.status(200).json({
      message: "Production batch deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting production batch:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
