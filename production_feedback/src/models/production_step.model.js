/**
 * Model ProductionStep untuk Production Feedback Service
 * 
 * Merepresentasikan langkah-langkah dalam proses produksi
 */
module.exports = (sequelize, DataTypes) => {
  const ProductionStep = sequelize.define('ProductionStep', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stepId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'ID unik untuk langkah produksi'
    },
    feedbackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID referensi ke ProductionFeedback'
    },
    machineId: {
      type: DataTypes.STRING(50),
      comment: 'ID mesin yang digunakan'
    },
    machineName: {
      type: DataTypes.STRING(255),
      comment: 'Nama mesin yang digunakan'
    },
    operatorId: {
      type: DataTypes.STRING(50),
      comment: 'ID operator yang menangani langkah ini'
    },
    operatorName: {
      type: DataTypes.STRING(255),
      comment: 'Nama operator'
    },
    stepName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nama langkah produksi'
    },
    stepOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Urutan langkah dalam proses produksi'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'skipped'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status langkah produksi'
    },
    startTime: {
      type: DataTypes.DATE,
      comment: 'Waktu mulai langkah produksi'
    },
    endTime: {
      type: DataTypes.DATE,
      comment: 'Waktu selesai langkah produksi'
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: 'Durasi langkah dalam menit'
    },
    expectedDuration: {
      type: DataTypes.INTEGER,
      comment: 'Durasi yang diharapkan dalam menit'
    },
    materialsUsed: {
      type: DataTypes.TEXT,
      comment: 'Daftar material yang digunakan (JSON)'
    },
    quantityProcessed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Jumlah yang diproses pada langkah ini'
    },
    quantityPassed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Jumlah yang lolos pada langkah ini'
    },
    quantityRejected: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Jumlah yang ditolak pada langkah ini'
    },
    issuesEncountered: {
      type: DataTypes.TEXT,
      comment: 'Masalah yang ditemui selama langkah produksi'
    },
    actionsTaken: {
      type: DataTypes.TEXT,
      comment: 'Tindakan yang diambil untuk mengatasi masalah'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Catatan tambahan tentang langkah produksi'
    }
  }, {
    tableName: 'production_steps',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['stepId']
      },
      {
        fields: ['feedbackId']
      },
      {
        fields: ['machineId']
      },
      {
        fields: ['status']
      }
    ]
  });

  ProductionStep.associate = (models) => {
    // Relasi dengan ProductionFeedback (banyak langkah produksi milik satu feedback)
    ProductionStep.belongsTo(models.ProductionFeedback, {
      foreignKey: 'feedbackId',
      as: 'productionFeedback'
    });

    // Relasi dengan QualityCheck (satu langkah produksi memiliki banyak pemeriksaan kualitas)
    ProductionStep.hasMany(models.QualityCheck, {
      foreignKey: 'stepId',
      as: 'qualityChecks'
    });

    // Relasi dengan FeedbackImage (satu langkah produksi memiliki banyak gambar)
    ProductionStep.hasMany(models.FeedbackImage, {
      foreignKey: 'stepId',
      as: 'images'
    });
  };

  return ProductionStep;
};
