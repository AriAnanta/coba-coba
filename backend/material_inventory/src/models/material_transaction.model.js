/**
 * Model MaterialTransaction
 *
 * Merepresentasikan transaksi material (masuk/keluar)
 */
module.exports = (sequelize, DataTypes) => {
  const MaterialTransaction = sequelize.define(
    "MaterialTransaction",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      transactionId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "transaction_id",
      },
      materialId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "materials",
          key: "id",
        },
        field: "material_id",
      },
      type: {
        type: DataTypes.ENUM(
          "Receipt",
          "Issue",
          "Adjustment",
          "Return",
          "Transfer",
          "Scrap"
        ),
        allowNull: false,
        comment:
          "Jenis transaksi: penerimaan, pengeluaran, penyesuaian, pengembalian, transfer, atau scrap",
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        comment: "Jumlah material (positif untuk masuk, negatif untuk keluar)",
      },
      unit: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "transaction_date",
      },
      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "suppliers",
          key: "id",
        },
        field: "supplier_id",
      },
      referenceNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Nomor referensi PO/DO/batch produksi",
        field: "reference_number",
      },
      unitPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.0,
        field: "unit_price",
      },
      totalPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.0,
        field: "total_price",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "created_by",
      },
    },
    {
      tableName: "material_transactions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Definisi asosiasi
  MaterialTransaction.associate = (models) => {
    MaterialTransaction.belongsTo(models.Material, {
      foreignKey: "materialId",
      as: "material",
    });

    MaterialTransaction.belongsTo(models.Supplier, {
      foreignKey: "supplierId",
      as: "supplier",
    });
  };

  return MaterialTransaction;
};
