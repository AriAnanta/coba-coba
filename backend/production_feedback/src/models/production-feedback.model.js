/**
 * Model untuk ProductionFeedback
 * 
 * Mendefinisikan struktur tabel production_feedbacks
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionFeedback = sequelize.define('ProductionFeedback', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    feedbackId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'feedback_id'
    },
    batchId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'batch_id'
    },
    // orderId: {
    //   type: DataTypes.STRING(50),
    //   allowNull: true,
    //   field: 'order_id'
    // },
    // productId: {
    //   type: DataTypes.STRING(50),
    //   allowNull: true,
    //   field: 'product_id'
    // },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'product_name'
    },
    productionPlanId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'production_plan_id'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_production', 'on_hold', 'completed', 'cancelled', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    plannedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'planned_quantity'
    },
    actualQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'actual_quantity'
    },
    // defectQuantity: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   field: 'defect_quantity'
    // },
    // qualityScore: {
    //   type: DataTypes.FLOAT,
    //   allowNull: true,
    //   field: 'quality_score'
    // },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date'
    },
    // isMarketplaceUpdated: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: false,
    //   defaultValue: false,
    //   field: 'is_marketplace_updated'
    // },
    // marketplaceUpdateDate: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    //   field: 'marketplace_update_date'
    // },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
    // createdBy: {
    //   type: DataTypes.STRING(50),
    //   allowNull: true,
    //   field: 'created_by'
    // },
    // updatedBy: {
    //   type: DataTypes.STRING(50),
    //   allowNull: true,
    //   field: 'updated_by'
    // }
  }, {
    tableName: 'production_feedbacks',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_feedback_id',
        fields: ['feedback_id']
      },
      {
        name: 'idx_batch_id',
        fields: ['batch_id']
      },
      {
        name: 'idx_status',
        fields: ['status']
      }
    ]
  });

  return ProductionFeedback;
};