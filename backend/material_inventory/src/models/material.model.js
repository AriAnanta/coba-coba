/**
 * Model Material
 *
 * Merepresentasikan data material bahan baku
 */
module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define(
    "Material",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      materialId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "material_id",
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.ENUM(
          "Raw Material",
          "Component",
          "Work-in-Progress (WIP)",
          "Finished Goods",
          "Packaging Material",
          "Consumable",
          "Spare Part",
          "Tool"
        ),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      unit: {
        type: DataTypes.ENUM(
          "Kilogram (kg)",
          "Gram (g)",
          "Liter (L)",
          "Milliliter (mL)",
          "Pieces (pcs)",
          "Meter (m)",
          "Square Meter (m²)",
          "Cubic Meter (m³)",
          "Ton"
        ),
        allowNull: false,
        comment: "Satuan pengukuran (kg, liter, meter, dll)",
      },
      stockQuantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        field: "stock_quantity",
      },
      reorderLevel: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 10,
        comment: "Jumlah minimum sebelum perlu melakukan pemesanan ulang",
        field: "reorder_level",
      },
      price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: "Harga per unit",
        field: "price",
      },
      leadTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Waktu pengiriman dalam hari",
        field: "lead_time",
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Lokasi penyimpanan di gudang",
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
      status: {
        type: DataTypes.ENUM(
          "active",
          "low_stock",
          "out_of_stock",
          "discontinued"
        ),
        defaultValue: "active",
        field: "status",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "notes",
      },
    },
    {
      tableName: "materials",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Definisi asosiasi
  Material.associate = (models) => {
    Material.belongsTo(models.Supplier, {
      foreignKey: "supplierId",
      as: "supplierInfo",
    });

    Material.hasMany(models.MaterialTransaction, {
      foreignKey: "materialId",
      as: "transactions",
    });
  };

  return Material;
};
