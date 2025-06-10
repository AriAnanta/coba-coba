/**
 * Machine Queue Service
 *
 * Service untuk berkomunikasi dengan Machine Queue Service
 */
const axios = require('axios');
const config = require('../config/config');

/**
 * Mendapatkan detail tipe mesin berdasarkan ID
 * @param {number} machineTypeId - ID tipe mesin
 * @returns {Promise<Object>} - Detail tipe mesin
 */
exports.getMachineTypeById = async (machineTypeId) => {
  try {
    const response = await axios.post(
      `${config.machineQueueUrl}/graphql`,
      {
        query: `
          query MachineType($id: ID!) {
            machineType(id: $id) {
              id
              name
              description
              capacity
              setupTime
              processTimePerUnit
              maintenanceInterval
              maintenanceDuration
            }
          }
        `,
        variables: { id: machineTypeId },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.machineType;
  } catch (error) {
    console.error(`Error getting machine type details: ${error.message}`);
    throw new Error(`Failed to get machine type details: ${error.message}`);
  }
};

/**
 * Mendapatkan daftar mesin berdasarkan tipe
 * @param {number} machineTypeId - ID tipe mesin
 * @returns {Promise<Array>} - Daftar mesin
 */
exports.getMachinesByType = async (machineTypeId) => {
  try {
    const response = await axios.post(
      `${config.machineQueueUrl}/graphql`,
      {
        query: `
          query MachinesByType($typeId: ID!) {
            machinesByType(typeId: $typeId) {
              id
              name
              machineTypeId
              status
              location
              lastMaintenanceDate
              nextMaintenanceDate
            }
          }
        `,
        variables: { typeId: machineTypeId },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.machinesByType || [];
  } catch (error) {
    console.error(`Error getting machines by type: ${error.message}`);
    return []; // Return empty array instead of throwing to handle gracefully
  }
};

/**
 * Memeriksa ketersediaan kapasitas mesin
 * @param {Array} capacityRequirements - Array objek dengan machineTypeId, startDate, endDate, dan requiredCapacity
 * @returns {Promise<Object>} - Hasil pemeriksaan ketersediaan
 */
exports.checkMachineCapacity = async (capacityRequirements) => {
  try {
    const response = await axios.post(
      `${config.machineQueueUrl}/graphql`,
      {
        query: `
          query CheckCapacity($input: [CapacityCheckInput!]!) {
            checkCapacity(input: $input) {
              machineTypeId
              available
              availableCapacity
              requiredCapacity
              shortageAmount
              suggestedStartDate
              suggestedEndDate
              availableMachines {
                machineId
                availableFrom
                availableTo
                availableCapacity
              }
            }
          }
        `,
        variables: {
          input: capacityRequirements.map(req => ({
            machineTypeId: req.machineTypeId,
            startDate: req.startDate,
            endDate: req.endDate,
            requiredCapacity: req.requiredCapacity
          }))
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.checkCapacity;
  } catch (error) {
    console.error(`Error checking machine capacity: ${error.message}`);
    throw new Error(`Failed to check machine capacity: ${error.message}`);
  }
};

/**
 * Mereservasi kapasitas mesin untuk produksi
 * @param {number} batchId - ID batch produksi
 * @param {Array} capacityReservations - Array objek dengan machineTypeId, machineId, startDate, endDate, dan requiredCapacity
 * @returns {Promise<Object>} - Hasil reservasi kapasitas
 */
exports.reserveMachineCapacity = async (batchId, capacityReservations) => {
  try {
    const response = await axios.post(
      `${config.machineQueueUrl}/graphql`,
      {
        query: `
          mutation ReserveCapacity($batchId: ID!, $reservations: [CapacityReservationInput!]!) {
            reserveCapacity(batchId: $batchId, reservations: $reservations) {
              success
              message
              reservations {
                machineId
                machineTypeId
                startDate
                endDate
                status
              }
            }
          }
        `,
        variables: {
          batchId,
          reservations: capacityReservations.map(res => ({
            machineTypeId: res.machineTypeId,
            machineId: res.machineId,
            startDate: res.startDate,
            endDate: res.endDate,
            requiredCapacity: res.requiredCapacity
          }))
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.reserveCapacity;
  } catch (error) {
    console.error(`Error reserving machine capacity: ${error.message}`);
    throw new Error(`Failed to reserve machine capacity: ${error.message}`);
  }
};

/**
 * Mendapatkan jadwal mesin untuk periode tertentu
 * @param {string} startDate - Tanggal mulai periode
 * @param {string} endDate - Tanggal akhir periode
 * @returns {Promise<Array>} - Jadwal mesin
 */
exports.getMachineSchedule = async (startDate, endDate) => {
  try {
    const response = await axios.post(
      `${config.machineQueueUrl}/graphql`,
      {
        query: `
          query MachineSchedule($startDate: DateTime!, $endDate: DateTime!) {
            machineSchedule(startDate: $startDate, endDate: $endDate) {
              machineId
              machineName
              machineTypeId
              machineTypeName
              reservations {
                id
                batchId
                startDate
                endDate
                status
              }
            }
          }
        `,
        variables: {
          startDate,
          endDate
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.machineSchedule || [];
  } catch (error) {
    console.error(`Error getting machine schedule: ${error.message}`);
    return []; // Return empty array instead of throwing to handle gracefully
  }
};