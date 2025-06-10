/**
 * Model untuk QuantityStock
 * 
 * Mendefinisikan struktur tabel quantity_stock
 */
module.exports = (sequelize, DataTypes) => {
  const QuantityStock = sequelize.define('QuantityStock', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    feedbackId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'feedback_id',
      references: {
        model: 'production_feedbacks',
        key: 'feedback_id'
      }
    },
    materialId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'material_id'
    },
    materialName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'material_name'
    },
    usedQuantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'used_quantity'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'updated_by'
    }
  }, {
    tableName: 'quantity_stock',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_feedback_id',
        fields: ['feedback_id']
      },
      {
        name: 'idx_material_id',
        fields: ['material_id']
      }
    ]
  });

  // Definisi asosiasi
  QuantityStock.associate = (models) => {
    QuantityStock.belongsTo(models.ProductionFeedback, {
      foreignKey: 'feedback_id',
      targetKey: 'feedbackId',
      as: 'feedback'
    });
  };

  return QuantityStock;
};