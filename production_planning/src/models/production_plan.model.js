/**
 * Model Production Plan
 *
 * Merepresentasikan rencana produksi yang dibuat berdasarkan permintaan produksi
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionPlan = sequelize.define(
    "ProductionPlan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      planId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "plan_id",
      },
      requestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID referensi ke production_management service",
        field: "request_id",
      },
      productionRequestId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Request ID dari production_management service",
        field: "production_request_id",
      },
      productName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "product_name",
      },
      plannedStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "planned_start_date",
      },
      plannedEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "planned_end_date",
      },
      priority: {
        type: DataTypes.ENUM("low", "normal", "high", "urgent"),
        defaultValue: "normal",
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "submitted",
          "approved",
          "in_progress",
          "completed",
          "cancelled"
        ),
        defaultValue: "draft",
      },
      planningNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "planning_notes",
      },
      plannedBatches: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "planned_batches",
      },
      batchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment:
          "ID referensi ke production_batch di production_management service",
        field: "batch_id",
      },
    },
    {
      tableName: "production_plans",
      timestamps: true,
      underscored: true,
    }
  );

  // Definisi asosiasi
  ProductionPlan.associate = (models) => {
    // Tidak ada asosiasi lagi setelah penghapusan CapacityPlan dan MaterialPlan
  };

  return ProductionPlan;
};
