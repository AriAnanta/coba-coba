/**
 * Inventory Controller
 * Handles material inventory operations
 */

// Mock data for demonstration (replace with actual database models)
let materials = [
  {
    id: 1,
    materialId: 'MAT001',
    materialName: 'Steel Sheet',
    materialType: 'Raw Material',
    unitOfMeasure: 'kg',
    currentStock: 500,
    reservedStock: 50,
    availableStock: 450,
    minimumStock: 100,
    standardCost: 25.50,
    supplier: 'Steel Corp',
    lastUpdated: new Date()
  },
  {
    id: 2,
    materialId: 'MAT002',
    materialName: 'Aluminum Rod',
    materialType: 'Raw Material',
    unitOfMeasure: 'meter',
    currentStock: 200,
    reservedStock: 20,
    availableStock: 180,
    minimumStock: 50,
    standardCost: 15.75,
    supplier: 'Metal Works',
    lastUpdated: new Date()
  }
];

let reservations = [];
let nextReservationId = 1;

/**
 * Get all materials
 */
exports.getAllMaterials = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: materials,
      total: materials.length
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get material by ID
 */
exports.getMaterialById = async (req, res) => {
  try {
    const material = materials.find(m => m.materialId === req.params.materialId);
    
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Add new material
 */
exports.addMaterial = async (req, res) => {
  try {
    const {
      materialId,
      materialName,
      materialType,
      unitOfMeasure,
      currentStock,
      minimumStock,
      standardCost,
      supplier
    } = req.body;
    
    const newMaterial = {
      id: materials.length + 1,
      materialId,
      materialName,
      materialType,
      unitOfMeasure,
      currentStock: currentStock || 0,
      reservedStock: 0,
      availableStock: currentStock || 0,
      minimumStock: minimumStock || 0,
      standardCost: standardCost || 0,
      supplier,
      lastUpdated: new Date()
    };
    
    materials.push(newMaterial);
    
    res.status(201).json({
      success: true,
      message: 'Material added successfully',
      data: newMaterial
    });
  } catch (error) {
    console.error('Error adding material:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Update material
 */
exports.updateMaterial = async (req, res) => {
  try {
    const material = materials.find(m => m.materialId === req.params.materialId);
    
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    Object.assign(material, req.body, { lastUpdated: new Date() });
    
    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: material
    });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Delete material
 */
exports.deleteMaterial = async (req, res) => {
  try {
    const index = materials.findIndex(m => m.materialId === req.params.materialId);
    
    if (index === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    const deletedMaterial = materials.splice(index, 1)[0];
    
    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
      data: deletedMaterial
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get stock for material
 */
exports.getStock = async (req, res) => {
  try {
    const material = materials.find(m => m.materialId === req.params.materialId);
    
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        materialId: material.materialId,
        materialName: material.materialName,
        currentStock: material.currentStock,
        reservedStock: material.reservedStock,
        availableStock: material.availableStock,
        minimumStock: material.minimumStock,
        unitOfMeasure: material.unitOfMeasure
      }
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Add stock
 */
exports.addStock = async (req, res) => {
  try {
    const material = materials.find(m => m.materialId === req.params.materialId);
    
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    const { quantity, notes } = req.body;
    
    material.currentStock += quantity;
    material.availableStock = material.currentStock - material.reservedStock;
    material.lastUpdated = new Date();
    
    res.status(200).json({
      success: true,
      message: `Added ${quantity} ${material.unitOfMeasure} to stock`,
      data: material
    });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Consume stock
 */
exports.consumeStock = async (req, res) => {
  try {
    const material = materials.find(m => m.materialId === req.params.materialId);
    
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    const { quantity, notes } = req.body;
    
    if (material.currentStock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient stock' 
      });
    }
    
    material.currentStock -= quantity;
    material.availableStock = material.currentStock - material.reservedStock;
    material.lastUpdated = new Date();
    
    res.status(200).json({
      success: true,
      message: `Consumed ${quantity} ${material.unitOfMeasure} from stock`,
      data: material
    });
  } catch (error) {
    console.error('Error consuming stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Reserve materials for production
 */
exports.reserveMaterials = async (req, res) => {
  try {
    const { batchId, materials: requestedMaterials } = req.body;
    
    const reservation = {
      id: nextReservationId++,
      batchId,
      materials: [],
      status: 'pending',
      createdAt: new Date()
    };
    
    for (const reqMaterial of requestedMaterials) {
      const material = materials.find(m => m.materialId === reqMaterial.materialId);
      
      if (!material) {
        return res.status(404).json({ 
          success: false, 
          message: `Material ${reqMaterial.materialId} not found` 
        });
      }
      
      if (material.availableStock < reqMaterial.quantityRequired) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${material.materialName}` 
        });
      }
      
      // Reserve the material
      material.reservedStock += reqMaterial.quantityRequired;
      material.availableStock -= reqMaterial.quantityRequired;
      material.lastUpdated = new Date();
      
      reservation.materials.push({
        materialId: reqMaterial.materialId,
        quantityReserved: reqMaterial.quantityRequired,
        unitOfMeasure: reqMaterial.unitOfMeasure
      });
    }
    
    reservation.status = 'reserved';
    reservations.push(reservation);
    
    res.status(200).json({
      success: true,
      message: 'Materials reserved successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Error reserving materials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Release reserved materials
 */
exports.releaseMaterials = async (req, res) => {
  try {
    const { batchId } = req.body;
    
    const reservation = reservations.find(r => r.batchId === batchId);
    
    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reservation not found' 
      });
    }
    
    for (const reservedMaterial of reservation.materials) {
      const material = materials.find(m => m.materialId === reservedMaterial.materialId);
      
      if (material) {
        material.reservedStock -= reservedMaterial.quantityReserved;
        material.availableStock += reservedMaterial.quantityReserved;
        material.lastUpdated = new Date();
      }
    }
    
    reservation.status = 'released';
    
    res.status(200).json({
      success: true,
      message: 'Materials released successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Error releasing materials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get all reservations
 */
exports.getReservations = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: reservations,
      total: reservations.length
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get low stock report
 */
exports.getLowStockReport = async (req, res) => {
  try {
    const lowStockMaterials = materials.filter(m => m.currentStock <= m.minimumStock);
    
    res.status(200).json({
      success: true,
      data: lowStockMaterials,
      total: lowStockMaterials.length
    });
  } catch (error) {
    console.error('Error generating low stock report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get usage report
 */
exports.getUsageReport = async (req, res) => {
  try {
    const usageReport = materials.map(material => ({
      materialId: material.materialId,
      materialName: material.materialName,
      currentStock: material.currentStock,
      reservedStock: material.reservedStock,
      availableStock: material.availableStock,
      utilizationRate: ((material.currentStock - material.availableStock) / material.currentStock * 100).toFixed(2) + '%'
    }));
    
    res.status(200).json({
      success: true,
      data: usageReport,
      total: usageReport.length
    });
  } catch (error) {
    console.error('Error generating usage report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
