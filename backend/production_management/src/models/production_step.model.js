/**
 * Production Step Model
 *
 * Represents individual steps in a production batch
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionStep = sequelize.define(
    "ProductionStep",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "batch_id",
        references: {
          model: "production_batches",
          key: "id",
        },
      },
      stepName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      stepOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      machineType: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      scheduledStartTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      scheduledEndTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      machine_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "machine_id",
        references: {
          model: "machines",
          key: "id",
        },
      },
      operator_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "operator_id",
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
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "production_steps",
      timestamps: true,
      underscored: true,
    }
  );

  // Define associations
  ProductionStep.associate = (models) => {
    ProductionStep.belongsTo(models.ProductionBatch, {
      foreignKey: "batch_id",
      as: "batch",
    });
  };

  return ProductionStep;
};
