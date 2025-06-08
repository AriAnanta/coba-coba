/**
 * Model QualityCheck untuk Production Feedback Service
 * 
 * Merepresentasikan pemeriksaan kualitas pada produksi
 */
module.exports = (sequelize, DataTypes) => {
  const QualityCheck = sequelize.define('QualityCheck', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    checkId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'ID unik untuk pemeriksaan kualitas'
    },
    feedbackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID referensi ke ProductionFeedback'
    },
    stepId: {
      type: DataTypes.INTEGER,
      comment: 'ID referensi ke ProductionStep (opsional, jika terkait dengan langkah spesifik)'
    },
    inspectorId: {
      type: DataTypes.STRING(50),
      comment: 'ID inspektor yang melakukan pemeriksaan'
    },
    inspectorName: {
      type: DataTypes.STRING(255),
      comment: 'Nama inspektor'
    },
    checkType: {
      type: DataTypes.ENUM('visual', 'dimensional', 'functional', 'material', 'safety', 'other'),
      allowNull: false,
      comment: 'Jenis pemeriksaan kualitas'
    },
    checkName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nama pemeriksaan kualitas'
    },
    checkDescription: {
      type: DataTypes.TEXT,
      comment: 'Deskripsi pemeriksaan kualitas'
    },
    standard: {
      type: DataTypes.TEXT,
      comment: 'Standar atau spesifikasi yang digunakan'
    },
    result: {
      type: DataTypes.ENUM('passed', 'failed', 'pending', 'waived'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Hasil pemeriksaan kualitas'
    },
    quantityChecked: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Jumlah yang diperiksa'
    },
    quantityPassed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Jumlah yang lolos pemeriksaan'
    },
    quantityRejected: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Jumlah yang ditolak dalam pemeriksaan'
    },
    measurementValue: {
      type: DataTypes.FLOAT,
      comment: 'Nilai pengukuran (jika berlaku)'
    },
    measurementUnit: {
      type: DataTypes.STRING(50),
      comment: 'Satuan pengukuran (jika berlaku)'
    },
    toleranceMin: {
      type: DataTypes.FLOAT,
      comment: 'Batas toleransi minimum (jika berlaku)'
    },
    toleranceMax: {
      type: DataTypes.FLOAT,
      comment: 'Batas toleransi maksimum (jika berlaku)'
    },
    checkDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Tanggal dan waktu pemeriksaan'
    },
    defects: {
      type: DataTypes.TEXT,
      comment: 'Deskripsi cacat atau masalah yang ditemukan'
    },
    correctiveActions: {
      type: DataTypes.TEXT,
      comment: 'Tindakan korektif yang diambil'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Catatan tambahan tentang pemeriksaan kualitas'
    }
  }, {
    tableName: 'quality_checks',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['checkId']
      },
      {
        fields: ['feedbackId']
      },
      {
        fields: ['stepId']
      },
      {
        fields: ['result']
      }
    ]
  });

  QualityCheck.associate = (models) => {
    // Relasi dengan ProductionFeedback (banyak pemeriksaan kualitas milik satu feedback)
    QualityCheck.belongsTo(models.ProductionFeedback, {
      foreignKey: 'feedbackId',
      as: 'productionFeedback'
    });

    // Relasi dengan ProductionStep (banyak pemeriksaan kualitas milik satu langkah produksi)
    QualityCheck.belongsTo(models.ProductionStep, {
      foreignKey: 'stepId',
      as: 'productionStep'
    });

    // Relasi dengan FeedbackImage (satu pemeriksaan kualitas memiliki banyak gambar)
    QualityCheck.hasMany(models.FeedbackImage, {
      foreignKey: 'qualityCheckId',
      as: 'images'
    });
  };

  return QualityCheck;
};
