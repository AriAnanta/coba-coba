/**
 * Model ProductionFeedback untuk Production Feedback Service
 *
 * Merepresentasikan feedback utama untuk setiap produksi
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionFeedback = sequelize.define(
    "ProductionFeedback",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      feedbackId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: "ID unik untuk feedback produksi",
      },
      productionId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "ID produksi dari Production Management",
      },
      batchId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "ID batch produksi",
      },
      productId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "ID produk yang diproduksi",
      },
      productName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Nama produk",
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "in_progress",
          "completed",
          "failed",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "pending",
        comment: "Status keseluruhan produksi",
      },
      startDate: {
        type: DataTypes.DATE,
        comment: "Tanggal mulai produksi",
      },
      endDate: {
        type: DataTypes.DATE,
        comment: "Tanggal selesai produksi",
      },
      quantityOrdered: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Jumlah yang dipesan",
      },
      quantityProduced: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Jumlah yang berhasil diproduksi",
        field: "actual_quantity",
      },
      quantityRejected: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Jumlah yang ditolak/gagal",
        field: "defect_quantity",
      },
      completionPercentage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: "Persentase penyelesaian produksi",
      },
      qualityScore: {
        type: DataTypes.FLOAT,
        comment: "Skor kualitas produksi (0-100)",
      },
      notes: {
        type: DataTypes.TEXT,
        comment: "Catatan umum tentang produksi",
      },
      customerNotes: {
        type: DataTypes.TEXT,
        comment: "Catatan untuk pelanggan/marketplace",
      },
      marketplaceUpdateStatus: {
        type: DataTypes.ENUM("pending", "sent", "confirmed", "failed"),
        allowNull: false,
        defaultValue: "pending",
        comment: "Status update ke marketplace",
      },
      marketplaceLastUpdate: {
        type: DataTypes.DATE,
        comment: "Timestamp update terakhir ke marketplace",
      },
      createdBy: {
        type: DataTypes.STRING(50),
        comment: "User yang membuat feedback",
      },
      updatedBy: {
        type: DataTypes.STRING(50),
        comment: "User yang terakhir mengupdate feedback",
      },
    },
    {
      tableName: "production_feedbacks",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["feedbackId"],
        },
        {
          fields: ["productionId"],
        },
        {
          fields: ["batchId"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );

  ProductionFeedback.associate = (models) => {
    // Relasi dengan FeedbackNotification (satu feedback memiliki banyak notifikasi)
    ProductionFeedback.hasMany(models.FeedbackNotification, {
      foreignKey: "feedbackId",
      as: "notifications",
    });
  };

  return ProductionFeedback;
};
