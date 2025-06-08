import axios from "axios";

const PRODUCTION_API_URL = "http://localhost:5001/api/production";

const productionService = {
  getAllRequests: async () => {
    const response = await axios.get(PRODUCTION_API_URL);
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await axios.get(`${PRODUCTION_API_URL}/${id}`);
    return response.data;
  },

  createRequest: async (requestData) => {
    const response = await axios.post(PRODUCTION_API_URL, requestData);
    return response.data;
  },

  updateRequest: async (id, requestData) => {
    const response = await axios.put(
      `${PRODUCTION_API_URL}/${id}`,
      requestData
    );
    return response.data;
  },

  deleteRequest: async (id) => {
    const response = await axios.delete(`${PRODUCTION_API_URL}/${id}`);
    return response.data;
  },

  cancelRequest: async (id) => {
    const response = await axios.post(`${PRODUCTION_API_URL}/${id}/cancel`);
    return response.data;
  },

  // This could be used for external ingestion, though createRequest also handles it
  ingestExternalRequest: async (requestData) => {
    const response = await axios.post(
      `${PRODUCTION_API_URL}/ingest`,
      requestData
    );
    return response.data;
  },
};

export default productionService;
