import axios from "axios";

const BATCH_API_URL = "http://localhost:5001/api/batches";

const batchService = {
  getAllBatches: async () => {
    const response = await axios.get(BATCH_API_URL);
    return response.data;
  },

  getBatchById: async (id) => {
    const response = await axios.get(`${BATCH_API_URL}/${id}`);
    return response.data;
  },

  createBatch: async (batchData) => {
    const response = await axios.post(BATCH_API_URL, batchData);
    return response.data;
  },

  updateBatch: async (id, batchData) => {
    const response = await axios.put(`${BATCH_API_URL}/${id}`, batchData);
    return response.data;
  },

  deleteBatch: async (id) => {
    const response = await axios.delete(`${BATCH_API_URL}/${id}`);
    return response.data;
  },

  startProduction: async (id) => {
    const response = await axios.put(`${BATCH_API_URL}/${id}`, {
      status: "in_progress",
    });
    return response.data;
  },

  // Step management
  getBatchSteps: async (batchId) => {
    const response = await axios.get(`${BATCH_API_URL}/${batchId}/steps`);
    return response.data;
  },

  createProductionStep: async (batchId, stepData) => {
    const response = await axios.post(
      `${BATCH_API_URL}/${batchId}/steps`,
      stepData
    );
    return response.data;
  },

  updateProductionStep: async (batchId, stepId, stepData) => {
    const response = await axios.put(
      `${BATCH_API_URL}/${batchId}/steps/${stepId}`,
      stepData
    );
    return response.data;
  },

  deleteProductionStep: async (batchId, stepId) => {
    const response = await axios.delete(
      `${BATCH_API_URL}/${batchId}/steps/${stepId}`
    );
    return response.data;
  },

  startProductionStep: async (batchId, stepId, data) => {
    const response = await axios.put(
      `${BATCH_API_URL}/${batchId}/steps/${stepId}/start`,
      data
    );
    return response.data;
  },

  completeProductionStep: async (batchId, stepId, data) => {
    const response = await axios.put(
      `${BATCH_API_URL}/${batchId}/steps/${stepId}/complete`,
      data
    );
    return response.data;
  },

  // Material Allocation management
  getBatchMaterials: async (batchId) => {
    const response = await axios.get(`${BATCH_API_URL}/${batchId}/materials`);
    return response.data;
  },

  createMaterialAllocation: async (batchId, materialData) => {
    const response = await axios.post(
      `${BATCH_API_URL}/${batchId}/materials`,
      materialData
    );
    return response.data;
  },

  updateMaterialAllocation: async (batchId, allocationId, materialData) => {
    const response = await axios.put(
      `${BATCH_API_URL}/${batchId}/materials/${allocationId}`,
      materialData
    );
    return response.data;
  },

  deleteMaterialAllocation: async (batchId, allocationId) => {
    const response = await axios.delete(
      `${BATCH_API_URL}/${batchId}/materials/${allocationId}`
    );
    return response.data;
  },

  allocateMaterial: async (batchId, allocationId, quantityAllocated) => {
    const response = await axios.put(
      `${BATCH_API_URL}/${batchId}/materials/${allocationId}/allocate`,
      { quantityAllocated }
    );
    return response.data;
  },

  consumeMaterial: async (batchId, allocationId) => {
    const response = await axios.put(
      `${BATCH_API_URL}/${batchId}/materials/${allocationId}/consume`
    );
    return response.data;
  },

  // Machine Queue Service - Updated to use correct port 5003
  generateMachineId: async () => {
    const response = await axios.get("http://localhost:5003/api/generate-machine-id");
    return response.data;
  },

  getAllMachines: async () => {
    const response = await axios.get("http://localhost:5003/api/machines");
    return response.data;
  },

  getMachineById: async (id) => {
    const response = await axios.get(`http://localhost:5003/api/machines/${id}`);
    return response.data;
  },

  createMachine: async (machineData) => {
    const response = await axios.post("http://localhost:5003/api/machines", machineData);
    return response.data;
  },

  updateMachine: async (id, machineData) => {
    const response = await axios.put(`http://localhost:5003/api/machines/${id}`, machineData);
    return response.data;
  },

  deleteMachine: async (id) => {
    const response = await axios.delete(`http://localhost:5003/api/machines/${id}`);
    return response.data;
  },

  // Machine Status Management
  updateMachineStatus: async (id, statusData) => {
    const response = await axios.put(`http://localhost:5003/api/machines/${id}/status`, statusData);
    return response.data;
  },

  getMaintenanceSchedule: async (days = 7) => {
    const response = await axios.get(`http://localhost:5003/api/maintenance-schedule?days=${days}`);
    return response.data;
  },

  getMachineStatusSummary: async () => {
    const response = await axios.get("http://localhost:5003/api/machine-status-summary");
    return response.data;
  },

  // Machine Types - Get types from operational machines
  getMachineTypes: async () => {
    const response = await axios.get("http://localhost:5003/api/machine-types");
    return response.data;
  },

  // Get operational machines with name and type
  getOperationalMachines: async () => {
    const response = await axios.get("http://localhost:5003/api/machines?status=operational");
    return response.data;
  },
};

export default batchService;
