/**
 * Production Management Service
 *
 * Service untuk berkomunikasi dengan Production Management Service
 */
const axios = require("axios");
const config = require("../config/config");

/**
 * Mendapatkan detail permintaan produksi berdasarkan ID
 * @param {number} requestId - ID permintaan produksi
 * @returns {Promise<Object>} - Detail permintaan produksi
 */
exports.getProductionRequestById = async (requestId) => {
  try {
    const response = await axios.get(
      `${config.productionManagementUrl}/api/production/${requestId}`
    );

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error(
      `Error getting production request details (REST): ${error.message}`
    );
    throw new Error(
      `Failed to get production request details: ${error.message}`
    );
  }
};

/**
 * Mendapatkan detail batch produksi berdasarkan ID
 * @param {number} batchId - ID batch produksi
 * @returns {Promise<Object>} - Detail batch produksi dengan nama produk dari request
 */
exports.getProductionBatchById = async (batchId) => {
  try {
    const response = await axios.post(
      `${config.productionManagementUrl}/graphql`,
      {
        query: `
          query ProductionBatch($id: ID!) {
            productionBatch(id: $id) {
              id
              batchNumber
              quantity
              scheduledStartDate
              scheduledEndDate
              request {
                id
                productName
                requestId
                priority
              }
            }
          }
        `,
        variables: { id: batchId },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const batchData = response.data.data.productionBatch;
    if (batchData && batchData.request) {
      console.log(
        "productionManagementService.getProductionBatchById: batchData.request.id = ",
        batchData.request.id,
        "Type: ",
        typeof batchData.request.id
      );
      return {
        ...batchData,
        productName: batchData.request.productName, // Extract productName from request
        requestId: batchData.request.id, // Ensure requestId is available
      };
    }
    return batchData;
  } catch (error) {
    console.error(`Error getting production batch details: ${error.message}`);
    throw new Error(`Failed to get production batch details: ${error.message}`);
  }
};

/**
 * Membuat batch produksi baru berdasarkan rencana produksi
 * @param {Object} productionPlan - Rencana produksi yang telah disetujui
 * @param {Array} steps - Langkah-langkah produksi dari rencana kapasitas
 * @param {Array} materials - Material yang dibutuhkan dari rencana material
 * @returns {Promise<Object>} - Batch produksi yang dibuat
 */
exports.createProductionBatch = async (productionPlan, steps, materials) => {
  try {
    const response = await axios.post(
      `${config.productionManagementUrl}/graphql`,
      {
        query: `
          mutation CreateBatch($input: BatchInput!) {
            createBatch(input: $input) {
              id
              batchNumber
              requestId
              quantity
              status
              startDate
              endDate
              notes
            }
          }
        `,
        variables: {
          input: {
            requestId: productionPlan.requestId,
            quantity: productionPlan.plannedBatches || 1,
            startDate: productionPlan.plannedStartDate,
            endDate: productionPlan.plannedEndDate,
            notes: `Created from production plan ${productionPlan.planId}`,
            steps: steps.map((step) => ({
              stepName: step.stepName,
              machineType: step.machineType,
              scheduledStartTime: step.startDate,
              scheduledEndTime: step.endDate,
              notes: step.notes,
            })),
            materials: materials.map((material) => ({
              materialId: material.materialId,
              quantityRequired: material.quantityRequired,
              unitOfMeasure: material.unitOfMeasure,
            })),
          },
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.createBatch;
  } catch (error) {
    console.error(`Error creating production batch: ${error.message}`);
    throw new Error(`Failed to create production batch: ${error.message}`);
  }
};

/**
 * Memperbarui status permintaan produksi
 * @param {number} requestId - ID permintaan produksi
 * @param {string} status - Status baru
 * @param {string} notes - Catatan tambahan
 * @returns {Promise<Object>} - Hasil pembaruan status
 */
exports.updateProductionRequestStatus = async (requestId, status, notes) => {
  try {
    const response = await axios.post(
      `${config.productionManagementUrl}/graphql`,
      {
        query: `
          mutation UpdateRequestStatus($id: ID!, $status: RequestStatus!, $notes: String) {
            updateRequestStatus(id: $id, status: $status, notes: $notes) {
              success
              message
              request {
                id
                status
                updatedAt
              }
            }
          }
        `,
        variables: {
          id: requestId,
          status,
          notes,
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.updateRequestStatus;
  } catch (error) {
    console.error(`Error updating production request status: ${error.message}`);
    throw new Error(
      `Failed to update production request status: ${error.message}`
    );
  }
};

/**
 * Mendapatkan daftar permintaan produksi yang belum direncanakan
 * @returns {Promise<Array>} - Daftar permintaan produksi
 */
exports.getUnplannedRequests = async () => {
  try {
    const response = await axios.post(
      `${config.productionManagementUrl}/graphql`,
      {
        query: `
          query UnplannedRequests {
            productionRequestsByStatus(status: APPROVED) {
              id
              productName
              quantity
              dueDate
              priority
              status
              notes
              createdAt
            }
          }
        `,
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.productionRequestsByStatus || [];
  } catch (error) {
    console.error(
      `Error getting unplanned production requests: ${error.message}`
    );
    return []; // Return empty array instead of throwing to handle gracefully
  }
};
