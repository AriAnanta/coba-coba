import axios from "axios";

const API_URL =
  import.meta.env.VITE_MATERIAL_INVENTORY_API_URL ||
  "http://localhost:5004/api";

const materialService = {
  getAllMaterials: async () => {
    try {
      const response = await axios.get(`${API_URL}/materials`);
      return response.data;
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw error;
    }
  },
};

export default materialService;
