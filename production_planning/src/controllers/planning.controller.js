/**
 * Controller Planning
 *
 * Mengelola operasi terkait perencanaan produksi
 */
const { ProductionPlan } = require("../models");
const axios = require("axios");
const productionManagementService = require("../services/productionManagement.service");
const config = require("../config/config");

/**
 * Mendapatkan semua rencana produksi
 */
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(plans);
  } catch (error) {
    console.error("Error mengambil rencana produksi:", error);
    return res.status(500).json({ message: "Kesalahan server internal" });
  }
};

/**
 * Mendapatkan detail rencana produksi berdasarkan ID
 */
exports.getPlanById = async (req, res) => {
  try {
    const plan = await ProductionPlan.findByPk(req.params.id);

    if (!plan) {
      return res
        .status(404)
        .json({ message: "Rencana produksi tidak ditemukan" });
    }

    return res.status(200).json(plan);
  } catch (error) {
    console.error("Error mengambil detail rencana produksi:", error);
    return res.status(500).json({ message: "Kesalahan server internal" });
  }
};

/**
 * Menerima notifikasi permintaan produksi baru dari Production Management Service
 */
exports.receiveNotification = async (req, res) => {
  try {
    const { requestId, priority, dueDate } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: "ID permintaan diperlukan" });
    }

    // Dapatkan detail permintaan dari Production Management Service
    let request;
    try {
      request = await productionManagementService.getProductionRequestById(
        requestId
      );
    } catch (error) {
      console.error("Gagal mendapatkan detail permintaan:", error.message);
      return res
        .status(404)
        .json({ message: "Detail permintaan tidak ditemukan" });
    }

    // Buat ID rencana unik
    const planId = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Buat rencana produksi awal
    const newPlan = await ProductionPlan.create({
      planId,
      requestId,
      productionRequestId: request.requestId || request.id,
      productName: request.productName,
      priority: priority || request.priority,
      plannedStartDate: new Date(),
      plannedEndDate: dueDate || request.dueDate,
      status: "draft",
      planningNotes: "Rencana dibuat otomatis dari notifikasi permintaan baru",
    });

    return res.status(201).json({
      message: "Notifikasi diterima dan rencana produksi dibuat",
      planId: newPlan.id,
    });
  } catch (error) {
    console.error("Error menerima notifikasi permintaan:", error);
    return res.status(500).json({ message: "Kesalahan server internal" });
  }
};

/**
 * Menerima pembaruan permintaan produksi dari Production Management Service
 */
exports.receiveUpdate = async (req, res) => {
  try {
    const { requestId, priority, status } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: "ID permintaan diperlukan" });
    }

    // Cari rencana produksi terkait
    const plan = await ProductionPlan.findOne({
      where: { requestId },
    });

    if (!plan) {
      return res
        .status(404)
        .json({ message: "Rencana produksi tidak ditemukan" });
    }

    // Update rencana produksi berdasarkan perubahan permintaan
    const updateData = {};

    if (priority) {
      updateData.priority = priority;
    }

    if (status === "cancelled") {
      updateData.status = "cancelled";
    }

    await plan.update(updateData);

    return res.status(200).json({
      message: "Rencana produksi diperbarui berdasarkan perubahan permintaan",
      planId: plan.id,
    });
  } catch (error) {
    console.error("Error memperbarui rencana produksi:", error);
    return res.status(500).json({ message: "Kesalahan server internal" });
  }
};

/**
 * Membuat rencana produksi baru secara manual
 */
exports.createPlan = async (req, res) => {
  try {
    const {
      requestId,
      productName,
      plannedStartDate,
      plannedEndDate,
      priority,
      planningNotes,
      batchId,
    } = req.body;

    // Validasi data masukan
    if (!requestId && !batchId) {
      return res
        .status(400)
        .json({ message: "ID permintaan atau ID batch diperlukan" });
    }

    let productNameFromSource = productName || "";
    let plannedStartDateFromSource = plannedStartDate || null;
    let plannedEndDateFromSource = plannedEndDate || null;
    let requestIdFromSource = requestId || null;
    let productionRequestIdFromSource = requestId || null;

    if (batchId) {
      try {
        const batch = await productionManagementService.getProductionBatchById(
          batchId
        );
        if (batch) {
          productNameFromSource =
            batch.request?.productName || batch.productName;
          plannedStartDateFromSource = batch.scheduledStartDate;
          plannedEndDateFromSource = batch.scheduledEndDate;
          requestIdFromSource = batch.request?.id || null;
          productionRequestIdFromSource = batch.request?.requestId || null;
        } else {
          return res.status(404).json({ message: "Batch tidak ditemukan" });
        }
      } catch (error) {
        console.error("Gagal mengambil detail batch:", error.message);
        return res
          .status(500)
          .json({ message: "Gagal mengambil detail batch" });
      }
    } else if (requestId) {
      try {
        const request =
          await productionManagementService.getProductionRequestById(requestId);
        if (request) {
          productNameFromSource = request.productName;
          plannedStartDateFromSource = request.dueDate;
          plannedEndDateFromSource = request.dueDate;
          requestIdFromSource = request.id;
          productionRequestIdFromSource = request.requestId;
        }
      } catch (error) {
        console.error("Gagal mengambil detail permintaan:", error.message);
        return res
          .status(404)
          .json({ message: "Detail permintaan tidak ditemukan" });
      }
    }

    // Buat ID rencana unik
    const planId = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Buat rencana produksi
    const newPlan = await ProductionPlan.create({
      planId,
      requestId: requestIdFromSource,
      productionRequestId: productionRequestIdFromSource,
      productName: productNameFromSource,
      plannedStartDate: plannedStartDateFromSource,
      plannedEndDate: plannedEndDateFromSource,
      priority: priority || "normal",
      status: "draft",
      planningNotes,
      batchId: batchId || null,
    });

    return res.status(201).json({
      message: "Rencana produksi berhasil dibuat",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Error membuat rencana produksi:", error);
    return res.status(500).json({ message: "Kesalahan server internal" });
  }
};

/**
 * Memperbarui rencana produksi
 */
exports.updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const {
      productName,
      plannedStartDate,
      plannedEndDate,
      priority,
      status,
      planningNotes,
      plannedBatches,
      batchId,
    } = req.body;

    // Cari rencana
    const plan = await ProductionPlan.findByPk(planId);

    if (!plan) {
      return res
        .status(404)
        .json({ message: "Rencana produksi tidak ditemukan" });
    }

    // Update bidang
    const updateData = {};
    if (productName !== undefined) updateData.productName = productName;
    if (plannedStartDate) updateData.plannedStartDate = plannedStartDate;
    if (plannedEndDate) updateData.plannedEndDate = plannedEndDate;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (planningNotes !== undefined) updateData.planningNotes = planningNotes;
    if (plannedBatches) updateData.plannedBatches = plannedBatches;
    if (batchId !== undefined) updateData.batchId = batchId;

    // Update rencana
    await plan.update(updateData);

    return res.status(200).json({
      message: "Rencana produksi berhasil diperbarui",
      plan: plan,
    });
  } catch (error) {
    console.error("Error memperbarui rencana produksi:", error);
    return res.status(500).json({ message: "Kesalahan server internal" });
  }
};

/**
 * Menghapus rencana produksi
 */
exports.deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;

    // Cari rencana
    const plan = await ProductionPlan.findByPk(planId);

    if (!plan) {
      return res
        .status(404)
        .json({ message: "Rencana produksi tidak ditemukan" });
    }

    // Hapus rencana
    await plan.destroy();

    return res.status(200).json({
      message: "Rencana produksi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error menghapus rencana produksi:", error);
    return res.status(500).json({ message: "Kesalahan server internal" });
  }
};

/**
 * Menyetujui rencana produksi
 */
exports.approvePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const { approvedBy, notes } = req.body; // approvedBy will be null from now on

    // Cari rencana
    const plan = await ProductionPlan.findByPk(planId);

    if (!plan) {
      return res
        .status(404)
        .json({ message: "Rencana produksi tidak ditemukan" });
    }

    // Perbarui status rencana
    await plan.update({
      status: "approved",
      // approvedBy is removed as a column
      // approvalDate is removed as a column
      planningNotes: notes
        ? `${plan.planningNotes || ""}\n${notes}`
        : plan.planningNotes,
    });

    // Kirim rencana produksi yang disetujui ke Production Management Service
    try {
      // Transformasi data untuk service
      const productionPlanData = {
        id: plan.id,
        planId: plan.planId,
        requestId: plan.requestId,
        productName: plan.productName,
        plannedStartDate: plan.plannedStartDate,
        plannedEndDate: plan.plannedEndDate,
        plannedBatches: plan.plannedBatches || 1,
        batchId: plan.batchId || null, // Ensure batchId is passed
      };

      // Kirim rencana ke Production Management Service (tanpa steps dan materials)
      const result = await productionManagementService.createProductionBatch(
        productionPlanData,
        [], // No steps
        [] // No materials
      );

      // Perbarui status rencana dengan info batch yang dibuat
      await plan.update({
        planningNotes: `${
          plan.planningNotes || ""
        }\nBatch produksi dibuat dengan ID: ${result.batchNumber || result.id}`,
      });

      return res.status(200).json({
        message: "Rencana produksi disetujui dan batch produksi dibuat",
        plan: plan,
        batchCreated: result,
      });
    } catch (error) {
      console.error("Gagal membuat batch produksi:", error.message);

      // Rencana tetap disetujui meskipun batch gagal dibuat
      return res.status(207).json({
        message:
          "Rencana produksi disetujui tetapi gagal membuat batch produksi",
        plan: plan,
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error menyetujui rencana produksi:", error);
    return res.status(500).json({ message: "Kesalahan server internal" });
  }
};
