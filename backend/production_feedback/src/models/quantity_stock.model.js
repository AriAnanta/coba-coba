/**
 * Model QuantityStock untuk Production Feedback Service
 *
 * Merepresentasikan data stok kuantitas produk yang diterima dari aplikasi lain
 */
module.exports = (sequelize, DataTypes) => {
  const QuantityStock = sequelize.define(
    "QuantityStock",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Nama produk",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Kuantitas stok",
      },
      reorderPoint: {
        type: DataTypes.INTEGER,
        comment: "Titik pemesanan ulang untuk produk",
      },
      status: {
        type: DataTypes.ENUM("received", "cancelled", "in_transit", "returned"),
        allowNull: false,
        defaultValue: "received",
        comment: "Status stok (misalnya, diterima, dibatalkan)",
      },
    },
    {
      tableName: "quantity_stock",
      timestamps: true,
      indexes: [
        {
          fields: ["productName"],
        },
      ],
    }
  );

  QuantityStock.associate = (models) => {
    // Relasi dengan ProductionFeedback (satu stok kuantitas dapat terkait dengan banyak feedback produksi)
    // Karena tidak ada foreign key langsung, relasi ini bersifat konseptual/melalui logika aplikasi
    // Misalnya, bisa berdasarkan `productName` atau jika nanti ada `productId` unik
  };

  return QuantityStock;
};
