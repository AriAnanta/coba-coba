/**
 * Production Batch Model
 *
 * Represents a production batch with associated steps and materials
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionBatch = sequelize.define(
    "ProductionBatch",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      batchNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "request_id",
        references: {
          model: "production_requests",
          key: "id",
        },
      },
      scheduledStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      scheduledEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "scheduled",
          "in_progress",
          "completed",
          "cancelled"
        ),
        defaultValue: "pending",
      },
      materialsAssigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      machineAssigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "production_batches",
      timestamps: true,
      underscored: true,
    }
  );

  // Define associations
  ProductionBatch.associate = (models) => {
    ProductionBatch.belongsTo(models.ProductionRequest, {
      foreignKey: "request_id",
      as: "request",
    });

    ProductionBatch.hasMany(models.ProductionStep, {
      foreignKey: "batch_id",
      as: "steps",
    });

    ProductionBatch.hasMany(models.MaterialAllocation, {
      foreignKey: "batch_id",
      as: "materialAllocations",
    });
  };

  return ProductionBatch;
};
