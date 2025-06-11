import axios from "axios";

const API_URL =
  import.meta.env.VITE_MATERIAL_INVENTORY_API_URL ||
  "http://localhost:5004/api";

const supplierService = {
  getAllSuppliers: async () => {
    try {
      const response = await axios.get(`${API_URL}/suppliers`);
      return response.data;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },
};

export default supplierService;
