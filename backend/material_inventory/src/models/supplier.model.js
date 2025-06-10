/**
 * Model Supplier
 *
 * Merepresentasikan data pemasok bahan baku
 */
module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define(
    "Supplier",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      supplierId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "supplier_id",
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      contactPerson: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "contact_person",
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      postalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "postal_code",
      },
      website: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      paymentTerms: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Syarat pembayaran (misal: Net 30, COD)",
        field: "payment_terms",
      },
      leadTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Waktu pengiriman rata-rata dalam hari",
        field: "lead_time",
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
        comment: "Penilaian kinerja pemasok (0-5)",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "blacklisted"),
        defaultValue: "active",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "suppliers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Definisi asosiasi
  Supplier.associate = (models) => {
    Supplier.hasMany(models.Material, {
      foreignKey: "supplierId",
      as: "materials",
    });
  };

  return Supplier;
};
