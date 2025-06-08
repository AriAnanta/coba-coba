/**
 * Material Inventory Service
 *
 * Service untuk berkomunikasi dengan Material Inventory Service
 */
const axios = require('axios');
const config = require('../config/config');

/**
 * Mendapatkan detail material berdasarkan ID
 * @param {number} materialId - ID material yang akan dicari
 * @returns {Promise<Object>} - Detail material
 */
exports.getMaterialById = async (materialId) => {
  try {
    const response = await axios.post(
      `${config.materialInventoryUrl}/graphql`,
      {
        query: `
          query Material($id: ID!) {
            material(id: $id) {
              id
              materialId
              name
              description
              category
              type
              unit
              stockQuantity
              reorderLevel
              price
              leadTime
              location
              status
            }
          }
        `,
        variables: { id: materialId },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.material;
  } catch (error) {
    console.error(`Error getting material details: ${error.message}`);
    throw new Error(`Failed to get material details: ${error.message}`);
  }
};

/**
 * Mendapatkan daftar material berdasarkan nama produk
 * @param {string} productName - Nama produk
 * @returns {Promise<Array>} - Daftar material yang dibutuhkan untuk produk
 */
exports.getMaterialsByProduct = async (productName) => {
  try {
    const response = await axios.post(
      `${config.materialInventoryUrl}/graphql`,
      {
        query: `
          query MaterialsByProduct($productName: String!) {
            materialsByProduct(productName: $productName) {
              id
              materialId
              name
              unit
              stockQuantity
              price
              quantityPerUnit
            }
          }
        `,
        variables: { productName },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.materialsByProduct || [];
  } catch (error) {
    console.error(`Error getting materials for product: ${error.message}`);
    return []; // Return empty array instead of throwing to handle gracefully
  }
};

/**
 * Memeriksa ketersediaan stok material
 * @param {Array} materials - Array objek material dengan materialId dan quantity
 * @returns {Promise<Object>} - Hasil pemeriksaan ketersediaan
 */
exports.checkMaterialAvailability = async (materials) => {
  try {
    const response = await axios.post(
      `${config.materialInventoryUrl}/graphql`,
      {
        query: `
          query CheckStock($input: [StockCheckInput!]!) {
            checkStock(input: $input) {
              materialId
              available
              stockQuantity
              requiredQuantity
              shortageAmount
              estimatedAvailabilityDate
            }
          }
        `,
        variables: {
          input: materials.map(m => ({
            materialId: m.materialId,
            quantity: m.quantity
          }))
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.checkStock;
  } catch (error) {
    console.error(`Error checking material availability: ${error.message}`);
    throw new Error(`Failed to check material availability: ${error.message}`);
  }
};

/**
 * Mereservasi material untuk produksi
 * @param {number} batchId - ID batch produksi
 * @param {Array} materials - Array objek material dengan materialId dan quantity
 * @returns {Promise<Object>} - Hasil reservasi material
 */
exports.reserveMaterials = async (batchId, materials) => {
  try {
    const response = await axios.post(
      `${config.materialInventoryUrl}/graphql`,
      {
        query: `
          mutation ReserveMaterials($batchId: ID!, $materials: [MaterialReservationInput!]!) {
            reserveMaterials(batchId: $batchId, materials: $materials) {
              success
              message
              reservations {
                materialId
                quantityReserved
                status
              }
            }
          }
        `,
        variables: {
          batchId,
          materials: materials.map(m => ({
            materialId: m.materialId,
            quantity: m.quantity
          }))
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.reserveMaterials;
  } catch (error) {
    console.error(`Error reserving materials: ${error.message}`);
    throw new Error(`Failed to reserve materials: ${error.message}`);
  }
};